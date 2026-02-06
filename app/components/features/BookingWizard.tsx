'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingSchema, type Booking } from '@/lib/schemas';
import { z } from 'zod';

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
  status: 'pending'
};

export default function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Booking>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState('');

  // Load params on mount
  useEffect(() => {
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

      alert("Appointment Confirmed! We'll see you on " + formData.preferredDate);
      router.push('/');
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
                      className={`w-full p-2 rounded border ${errors.preferredDate ? 'border-red-300' : 'border-blue-200'} bg-white`}
                      value={formData.preferredDate}
                      onChange={e => updateFields({ preferredDate: e.target.value })}
                    />
                    {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Time <span className="text-red-500">*</span></label>
                    <select
                      className={`w-full p-2 rounded border ${errors.preferredTime ? 'border-red-300' : 'border-blue-200'} bg-white`}
                      value={formData.preferredTime}
                      onChange={e => updateFields({ preferredTime: e.target.value })}
                    >
                      <option value="">Select Time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="2:15 PM">2:15 PM</option>
                      <option value="4:45 PM">4:45 PM</option>
                    </select>
                    {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime[0]}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  value={formData.visitReason}
                  onChange={e => updateFields({ visitReason: e.target.value })}
                >
                  <option>Wellness Exam</option>
                  <option>Vaccinations</option>
                  <option>Dental Assessment</option>
                  <option>Sick Visit / Injury</option>
                  <option>Surgery Consultation</option>
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

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center text-sm">4</span>
              Review & Submit
            </h2>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4 bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="text-2xl">📅</div>
                <div>
                  <h3 className="font-bold text-primary">Appointment Requested</h3>
                  <p className="font-semibold text-gray-700">{formData.preferredDate || 'N/A'} at {formData.preferredTime || 'N/A'}</p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold text-gray-800 mb-2">Pet Information</h3>
                <p className="text-gray-600">Name: <span className="font-semibold text-gray-800">{formData.petName}</span></p>
                <p className="text-gray-600">Type: {formData.petType} ({formData.breed || 'Unknown'})</p>
                <p className="text-gray-600">Age: {formData.age || 'N/A'}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold text-gray-800 mb-2">Details</h3>
                <p className="text-gray-600">Reason: {formData.visitReason}</p>
                <p className="text-gray-600 mt-1">Notes: <span className="italic">{formData.symptoms || "None provided"}</span></p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Contact Info</h3>
                <p className="text-gray-600">{formData.ownerName}</p>
                <p className="text-gray-600">{formData.email}</p>
                <p className="text-gray-600">{formData.phone}</p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4 p-4 bg-green-50 rounded-lg text-sm text-green-800 border border-green-100">
              <span className="text-xl">🛡️</span>
              <p>We prioritize your privacy. Your information is secure and will only be used for your pet's care.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
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
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full bg-accent text-white font-bold shadow-md hover:bg-[#d97f17] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
