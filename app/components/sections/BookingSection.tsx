'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';


export default function BookingSection() {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dates, setDates] = useState<{ dayName: string; dateNum: number; fullDate: string; displayMonth: string; year: number; isPast: boolean }[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isTaken: boolean }[]>([]);
  const [showMoreGroups, setShowMoreGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Function to generate dates for a selected month
  const generateDatesForMonth = (baseDate: Date) => {
    const nextDays = [];
    const daysMap = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const isPast = d < today;
      
      nextDays.push({
        dayName: daysMap[d.getDay()],
        dateNum: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
        displayMonth: d.toLocaleString('default', { month: 'long' }),
        year: d.getFullYear(),
        isPast
      });
    }
    return nextDays;
  };

  // Initial load
  useEffect(() => {
    setDates(generateDatesForMonth(new Date()));
  }, []);

  // Fetch availability when selected date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      const selectedDate = dates[selectedDateIndex]?.fullDate;
      if (!selectedDate) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data);
          // Auto-select first available or clear if current becomes taken
          if (selectedTime && data.find((s: any) => s.time === selectedTime)?.isTaken) {
            setSelectedTime(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch availability', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDateIndex, dates]);

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    // Reset to 1st of month if switching months
    newMonth.setDate(1);

    // If going back to current month, use today's date
    const today = new Date();
    if (newMonth.getMonth() === today.getMonth() && newMonth.getFullYear() === today.getFullYear()) {
      newMonth.setDate(today.getDate());
    }

    setCurrentMonth(newMonth);
    setDates(generateDatesForMonth(newMonth));
    setSelectedDateIndex(0); // Reset selection
    setSelectedTime(null);
  };

  const times = ['9:00 AM', '11:30 AM', '2:15 PM', '4:45 PM'];

  if (dates.length === 0) return null; // Hydration safe

  const currentSelection = dates[selectedDateIndex];

  return (
    <section className="py-16 md:py-24 px-[5%] bg-white flex justify-center" id="booking">
      <div className="max-w-[1000px] w-full flex flex-col md:flex-row items-center gap-10 md:gap-20 text-center md:text-left">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl mb-5 text-gray-800 font-bold">Booking Made Simple</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Skip the phone tag. View our real-time availability and book your appointment in under 60 seconds from any device.
          </p>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 justify-center md:justify-start">
            {['Instant Confirmation', 'Reminders via SMS', 'Easy Rescheduling'].map(feature => (
              <div key={feature} className="flex items-center gap-3 font-semibold text-primary justify-center md:justify-start text-sm sm:text-base">
                <span className="bg-blue-50 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs"><Check size={14} /></span> {feature}
              </div>

            ))}
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center relative mt-8 md:mt-0">
          <div className="bg-white rounded-[2rem] sm:rounded-[30px] shadow-2xl p-5 sm:p-8 border-4 sm:border-8 border-gray-50 relative w-full max-w-[420px]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <strong className="text-gray-900 text-lg">Select Date</strong>
              <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 pl-3 pr-1">
                <span className="font-bold text-gray-700 w-24 text-center text-sm">
                  {currentMonth.toLocaleString('default', { month: 'short' })} {currentMonth.getFullYear()}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-full text-gray-600 hover:text-primary disabled:opacity-30 cursor-pointer"
                    disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-full text-gray-600 hover:text-primary cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>

                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  const d = new Date(currentMonth);
                  d.setDate(currentMonth.getDate() - 7);
                  setCurrentMonth(d);
                  setDates(generateDatesForMonth(d));
                }}
                disabled={currentMonth <= new Date()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Week"
              >
                <ChevronLeft size={20} />
              </button>


              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center flex-1 mx-1 sm:mx-2">
                {dates.map((d, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all duration-200 border ${
                      d.isPast 
                        ? 'opacity-30 cursor-not-allowed border-transparent grayscale'
                        : selectedDateIndex === i
                        ? 'bg-primary text-white shadow-lg scale-110 border-primary z-10'
                        : 'text-gray-500 bg-white border-transparent hover:bg-gray-50'
                      }`}
                    onClick={() => !d.isPast && setSelectedDateIndex(i)}
                  >
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mb-0.5">{d.dayName}</span>
                    <span className="font-bold text-base sm:text-lg">{d.dateNum}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const d = new Date(currentMonth);
                  d.setDate(currentMonth.getDate() + 7);
                  setCurrentMonth(d);
                  setDates(generateDatesForMonth(d));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors flex-shrink-0"
                title="Next Week"
              >
                <ChevronRight size={20} />
              </button>

            </div>

            <div className="my-5 text-left">
              <p className="text-sm text-gray-400 mb-4">Available Times</p>
              
              {loading ? (
                <div className="py-4 text-center text-gray-400 text-sm animate-pulse bg-gray-50 rounded-xl">
                  Checking availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No slots found for this date.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    availableSlots.reduce((acc, slot) => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      const isPM = slot.time.includes('PM');
                      const absoluteHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
                      
                      let group = 'Morning';
                      if (absoluteHour >= 12 && absoluteHour < 17) group = 'Afternoon';
                      else if (absoluteHour >= 17) group = 'Evening';
                      
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(slot);
                      return acc;
                    }, {} as Record<string, typeof availableSlots>)
                  ).map(([group, slots]) => {
                    const isExpanded = showMoreGroups[group];
                    const visibleSlots = isExpanded ? slots : slots.slice(0, 4);
                    const hasMore = slots.length > 4;

                    return (
                      <div key={group} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{group}</span>
                          <div className="h-[1px] bg-gray-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {visibleSlots.map((slot) => (
                            <button
                              key={slot.time}
                              disabled={slot.isTaken}
                              className={`p-2.5 rounded-xl text-center border transition-all text-sm ${
                                selectedTime === slot.time
                                ? 'bg-primary text-white border-primary font-bold shadow-md'
                                : slot.isTaken
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60'
                                : 'text-gray-700 border-gray-200 bg-white hover:border-primary hover:text-primary active:scale-95'
                              }`}
                              onClick={() => setSelectedTime(slot.time)}
                            >
                              {slot.time} {slot.isTaken && '(Full)'}
                            </button>
                          ))}
                        </div>
                        {hasMore && (
                          <button 
                            onClick={() => setShowMoreGroups(prev => ({ ...prev, [group]: !isExpanded }))}
                            className="text-xs font-bold text-primary hover:underline mt-1 flex items-center gap-1"
                          >
                            {isExpanded ? 'Show Less' : `+${slots.length - 4} more slots`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Display Selected Date/Time clearly */}
            <div className={`min-h-[60px] bg-[#f8f9fa] rounded-xl p-3 mt-5 flex items-center justify-center border border-dashed border-gray-300 transition-opacity duration-300 ${selectedTime ? 'opacity-100' : 'opacity-50'}`}>
              {selectedTime ? (
                <div className="text-center">
                  <span className="block text-xs text-gray-500">You selected:</span>
                  <strong className="text-primary text-lg block">
                    {currentSelection.displayMonth} {currentSelection.dateNum} • {selectedTime}
                  </strong>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Select a time to continue</span>
              )}
            </div>

            {selectedTime && (
              <a
                href={`/book?date=${currentSelection.fullDate}&time=${selectedTime}`}
                className="mt-4 w-full bg-accent text-white border-none py-3.5 rounded-full font-bold cursor-pointer text-base shadow-md animate-pulse block text-center no-underline hover:scale-105 transition-transform"
              >
                Confirm Booking
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
