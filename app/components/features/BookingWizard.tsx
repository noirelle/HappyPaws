'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingSchema, type Booking } from '@/lib/schemas';
import { z } from 'zod';
import { Clock, Search, Check, Mail, Phone, User, Calendar, PawPrint, AlertTriangle } from 'lucide-react';

const INITIAL_DATA: Booking = {
  petName: '',
  petType: 'Dog',
  breed: '',
  age: '',
  gender: '',
  spayedNeutered: '', // Optional in schema but good to keep in state
  visitReason: 'Wellness Exam',
  symptoms: '',
  isEmergency: false,
  ownerName: '',
  email: '',
  phone: '',
  preferredDate: '',
  preferredTime: '',
  status: 'pending',
  vet_id: null
};

export default function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Booking>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [vets, setVets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<{time: string, isTaken: boolean}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serverError, setServerError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load params on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          const activeServices = data.filter((s: any) => s.is_active);
          setServices(activeServices);
          if (activeServices.length > 0 && !formData.visitReason) {
            setFormData(prev => ({ ...prev, visitReason: activeServices[0].name }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchVets = async () => {
      try {
        const url = searchQuery 
          ? `/api/public/vets?search=${encodeURIComponent(searchQuery)}` 
          : '/api/public/vets';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setVets(data);
        }
      } catch (error) {
        console.error('Failed to fetch vets', error);
      } finally {
        setLoadingVets(false);
      }
    };
    fetchVets();
    fetchServices();
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const reason = searchParams.get('reason');

    if (date || time || reason) {
      setFormData(prev => ({
        ...prev,
        preferredDate: date || prev.preferredDate,
        preferredTime: time || prev.preferredTime,
        visitReason: reason || prev.visitReason
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.preferredDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const vetId = (formData as any).vet_id || 'any';
        const res = await fetch(`/api/availability?date=${formData.preferredDate}&vetId=${vetId}`);
        if (res.ok) {
          setAvailableSlots(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch availability', error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [formData.preferredDate, (formData as any).vet_id]);

  const updateFields = (fields: Partial<Booking>) => {
    setFormData(prev => ({ ...prev, ...fields }));
    // Clear errors for fields being updated
    const newErrors = { ...errors };
    Object.keys(fields).forEach(key => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (currentStep: number) => {
    let fieldsToValidate: (keyof Booking)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['petName', 'petType'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['preferredDate', 'preferredTime', 'visitReason'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['ownerName', 'email', 'phone'];
    } else if (currentStep === 4) {
      // Step 4 is review, always valid to go back or forward (submit)
      return true;
    }

    // Create a partial schema for the current step
    const stepSchema = bookingSchema.pick(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {} as any)
    );

    const result = stepSchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Final full validation
    const validation = bookingSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          setErrors(result.details);
        }
        throw new Error(result.error || 'Failed to submit booking');
      }

      setStep(5);
    } catch (error: any) {
      setServerError(error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

      {/* Progress Bar */}
      {step < 5 && (
        <div className="bg-gray-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 md:p-10">

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {serverError}
          </div>
        )}

        {/* Step 1: Pet Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center text-sm">1</span>
              Pet Basics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pet's Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full p-3 rounded-lg border ${errors.petName ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                  value={formData.petName}
                  onChange={e => updateFields({ petName: e.target.value })}
                  placeholder="e.g. Buddy"
                />
                {errors.petName && <p className="text-red-500 text-xs mt-1">{errors.petName[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  value={formData.petType}
                  onChange={e => updateFields({ petType: e.target.value })}
                >
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Rabbit</option>
                  <option>Bird</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={formData.breed}
                  onChange={e => updateFields({ breed: e.target.value })}
                  placeholder="e.g. Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  value={formData.age}
                  onChange={e => updateFields({ age: e.target.value })}
                  placeholder="e.g. 5 years"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  value={formData.gender}
                  onChange={e => updateFields({ gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: medical Info */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center text-sm">2</span>
              Visit Details
            </h2>

            <div className="space-y-6">

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📅</span> Appointment Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full p-3 rounded-xl border-2 ${errors.preferredDate ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-white'} focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-700`}
                      value={formData.preferredDate}
                      onChange={e => updateFields({ preferredDate: e.target.value, preferredTime: '' })}
                    />
                    {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Time <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        className={`w-full p-3 rounded-xl border-2 ${errors.preferredTime ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-white'} focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-700 appearance-none disabled:opacity-50`}
                        value={formData.preferredTime}
                        onChange={e => updateFields({ preferredTime: e.target.value })}
                        disabled={!formData.preferredDate || loadingSlots}
                      >
                        <option value="">{formData.preferredDate ? (loadingSlots ? 'Checking slots...' : 'Select a Slot') : 'Select date first'}</option>
                        {availableSlots.map(slot => (
                          <option key={slot.time} value={slot.time} disabled={slot.isTaken}>
                            {slot.time} {slot.isTaken ? '(Taken)' : ''}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Clock size={16} className="text-blue-300" />
                      </div>
                    </div>
                    {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime[0]}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white disabled:opacity-50"
                  value={formData.visitReason}
                  onChange={e => updateFields({ visitReason: e.target.value })}
                  disabled={loadingServices}
                >
                  {loadingServices ? (
                    <option>Loading services...</option>
                  ) : services.length > 0 ? (
                    services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : (
                    <option>No services available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms or Notes</label>
                <textarea
                  className="w-full p-4 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all h-32 resize-none"
                  value={formData.symptoms}
                  onChange={e => updateFields({ symptoms: e.target.value })}
                  placeholder="Please describe any symptoms, behavioral changes, or questions you have..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
                <input
                  type="checkbox"
                  id="emergency"
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                  checked={formData.isEmergency}
                  onChange={e => updateFields({ isEmergency: e.target.checked })}
                />
                <label htmlFor="emergency" className="text-red-800 font-semibold cursor-pointer">
                  Is this an emergency? (Please call us immediately at 555-123-4567 if critical)
                </label>
              </div>

              <div className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <label className="block text-sm font-semibold text-gray-700">Preferred Specialist (Optional)</label>
                  <div className="relative flex-1 max-w-xs">
                     <input 
                       type="text"
                       placeholder="Search specialists..."
                       className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vets.map(vet => (
                    <div 
                      key={vet.id}
                      onClick={() => updateFields({ vet_id: vet.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        (formData as any).vet_id === vet.id 
                          ? 'border-primary bg-blue-50/50 shadow-md ring-2 ring-blue-100' 
                          : 'border-gray-100 hover:border-blue-200 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                        {vet.image}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{vet.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase">{vet.specialty}</div>
                      </div>
                    </div>
                  ))}
                  {loadingVets && <div className="col-span-2 text-center text-gray-400 text-sm">Loading specialists...</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Owner Info */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center text-sm">3</span>
              Your Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full p-3 rounded-lg border ${errors.ownerName ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                  value={formData.ownerName}
                  onChange={e => updateFields({ ownerName: e.target.value })}
                  placeholder="John Doe"
                />
                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName[0]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    value={formData.email}
                    onChange={e => updateFields({ email: e.target.value })}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    value={formData.phone}
                    onChange={e => updateFields({ phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="animate-in zoom-in-95 duration-500 text-center py-10 px-6">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
              ✓
            </div>
            
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Booking Confirmed!</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
              Yay! We've received your request for <span className="font-bold text-primary">{formData.petName}</span>. 
              We'll see you on <span className="font-bold text-primary">{formData.preferredDate}</span> at <span className="font-bold text-primary">{formData.preferredTime}</span>.
            </p>

            <div className="bg-blue-50/50 rounded-2xl p-8 mb-10 max-w-lg mx-auto border border-blue-100/50 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-8 text-left">
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Appointment</label>
                  <p className="font-bold text-gray-900">{formData.visitReason}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Patient</label>
                  <p className="font-bold text-gray-900">{formData.petName} ({formData.petType})</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Date</label>
                  <p className="font-bold text-gray-900">{formData.preferredDate}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Time</label>
                  <p className="font-bold text-gray-900">{formData.preferredTime}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary text-white font-bold shadow-xl hover:bg-[#009ad4] hover:scale-105 transition-all duration-300"
              >
                Back to Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(INITIAL_DATA);
                  setStep(1);
                }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-gray-700 font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300"
              >
                Book Another
              </button>
            </div>
            
            <p className="mt-10 text-sm text-gray-400">
              A confirmation email has been sent to <span className="font-medium text-gray-600">{formData.email}</span>
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 rounded-full text-gray-600 font-bold hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div> // Spacer
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold shadow-md hover:bg-[#009ad4] hover:shadow-lg transition-all"
              >
                Next Step
              </button>
            ) : step === 4 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-accent text-white font-bold shadow-md hover:bg-[#d97f17] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
              </button>
            ) : (
                <div /> // Step 5 has no nav
            )}
          </div>
        )}

      </form>
    </div>
  );
}
