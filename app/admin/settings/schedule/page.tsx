'use client';

import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
    Plus,
    Trash2,
    Settings,
    X,
    ChevronDown,
    CheckCircle
} from 'lucide-react';

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [vets, setVets] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVets, setSelectedVets] = useState<string[]>(['all']);
    const [timeFilter, setTimeFilter] = useState<string>('all'); // all, morning, afternoon
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [dayCounts, setDayCounts] = useState<Record<string, number>>({});

    // Slot Management State
    const [showSlotManager, setShowSlotManager] = useState(false);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [savingSlot, setSavingSlot] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [updatingBooking, setUpdatingBooking] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch everything independently to avoid one failure blocking everything
            const vetRes = await fetch('/api/vets');
            if (vetRes.ok) setVets(await vetRes.json());

            const bookingRes = await fetch(`/api/schedule?date=${selectedDate}`);
            if (bookingRes.ok) setBookings(await bookingRes.json());

            const slotRes = await fetch('/api/clinic-slots');
            if (slotRes.ok) setSlots(await slotRes.json());
        } catch (error) {
            console.error('Failed to fetch schedule data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]); // Only date triggers full fetch, vet filter is local for performance

    // Re-fetch slots specifically when manager opens
    useEffect(() => {
        if (showSlotManager) {
            setLoadingSlots(true);
            fetch('/api/clinic-slots')
                .then(res => res.ok ? res.json() : [])
                .then(data => setSlots(data))
                .catch(err => console.error('Failed to refresh slots', err))
                .finally(() => setLoadingSlots(false));
        }
    }, [showSlotManager]);

    // Fetch monthly counts when month changes
    useEffect(() => {
        const month = selectedDate.substring(0, 7);
        fetch(`/api/schedule/counts?month=${month}`)
            .then(res => res.ok ? res.json() : {})
            .then(data => setDayCounts(data))
            .catch(err => console.error('Failed to fetch counts', err));
    }, [selectedDate.substring(0, 7)]);

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlotTime) return;
        setSavingSlot(true);
        try {
            const res = await fetch('/api/clinic-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ time: newSlotTime })
            });
            if (res.ok) {
                setNewSlotTime('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to add slot', error);
        } finally {
            setSavingSlot(false);
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!confirm('Are you sure you want to remove this available time slot?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/clinic-slots?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Failed to delete slot', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdateBooking = async (id: number, updates: any) => {
        setUpdatingBooking(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });

            if (res.ok) {
                // Fetch the updated booking to sync modal
                const updatedRes = await fetch(`/api/bookings?id=${id}`);
                if (updatedRes.ok) {
                    const [updatedDetails] = await updatedRes.json();
                    if (updatedDetails) setSelectedBooking(updatedDetails);
                }
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update booking', error);
        } finally {
            setUpdatingBooking(false);
        }
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const normalizeTime = (time: string) => {
        if (!time) return '';
        return time.toLowerCase().trim().replace(/^0/, '').replace(/\s+/g, ' ');
    };

    const filteredSlots = slots.filter(slot => {
        if (timeFilter === 'all') return true;
        const hour = parseInt(slot.time.split(':')[0]);
        const isPM = slot.time.includes('PM') && hour !== 12;
        const actualHour = isPM ? hour + 12 : (hour === 12 && slot.time.includes('AM') ? 0 : hour);

        if (timeFilter === 'morning') return actualHour < 12;
        if (timeFilter === 'afternoon') return actualHour >= 12;
        return true;
    });

    const toggleVet = (vetId: string) => {
        if (vetId === 'all') {
            setSelectedVets(['all']);
            return;
        }

        setSelectedVets(prev => {
            const next = prev.filter(v => v !== 'all');
            if (next.includes(vetId)) {
                const updated = next.filter(v => v !== vetId);
                return updated.length === 0 ? ['all'] : updated;
            } else {
                return [...next, vetId];
            }
        });
    };

    const getIconForPet = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('dog')) return '🐶';
        if (t.includes('cat')) return '🐱';
        return '🐾';
    };

    const filteredBookings = bookings.filter(b => {
        if (selectedVets.includes('all')) return true;
        if (!b.vet_id) return false;
        return selectedVets.includes(b.vet_id.toString());
    });

    const effectiveVetCount = selectedVets.includes('all') ? Math.max(vets.length, 1) : selectedVets.length;
    const occupancyRate = Math.min(100, Math.round((filteredBookings.length / (slots.length * Math.max(effectiveVetCount, 1))) * 100)) || 0;


    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-0 sm:px-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:justify-end gap-4 px-4 sm:px-0">
                <div className="flex items-center bg-white rounded-xl p-1 border border-gray-100 shadow-sm relative w-full lg:w-auto">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex-1 lg:flex-none flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-50 rounded-lg transition-all min-w-[120px] sm:min-w-[160px]"
                    >
                        <CalendarIcon size={16} className="text-primary shrink-0" />
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-[10px] font-bold text-gray-400 underline decoration-primary/30 uppercase tracking-tight leading-none mb-1 truncate w-full">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-sm font-black text-gray-800 leading-none truncate w-full">
                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </button>

                    <div className="h-8 w-px bg-gray-100 mx-1 sm:mx-2"></div>

                    <div className="flex items-center pr-1">
                        <button onClick={() => changeDate(-1)} className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-primary">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => changeDate(1)} className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-primary">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Smart Calendar Popover */}
                    {showDatePicker && (
                        <CalendarPopover
                            selectedDate={selectedDate}
                            onSelect={(date: string) => {
                                setSelectedDate(date);
                                setShowDatePicker(false);
                            }}
                            dayCounts={dayCounts}
                            onClose={() => setShowDatePicker(false)}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 lg:p-2.5 p-3 rounded-xl transition-all border relative shrink-0 ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 shadow-sm'}`}
                    >
                        <Filter size={20} />
                        <span className="lg:hidden text-xs font-bold uppercase tracking-widest">Filters</span>
                        {(!selectedVets.includes('all') || timeFilter !== 'all') && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></div>
                        )}
                    </button>

                    <button
                        onClick={() => setShowSlotManager(!showSlotManager)}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 lg:p-2.5 p-3 rounded-xl transition-all border shrink-0 ${showSlotManager ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 shadow-sm'}`}
                    >
                        <Settings size={20} />
                        <span className="lg:hidden text-xs font-bold uppercase tracking-widest">Settings</span>
                    </button>
                </div>
            </div>

            {/* Filters Popover */}
            {showFilters && (
                <FiltersPopover
                    vets={vets}
                    selectedVets={selectedVets}
                    toggleVet={toggleVet}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {/* Slot Management - Integration in Flow */}
            {showSlotManager && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                        <div>
                            <h3 className="font-bold text-gray-800">Available Time Slots</h3>
                            <p className="text-xs text-gray-400 font-medium">Configure bookable appointment times</p>
                        </div>
                        <button onClick={() => setShowSlotManager(false)} className="text-gray-400 hover:text-gray-600 p-1">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleAddSlot} className="flex gap-2 max-w-sm mb-6">
                        <input
                            type="text"
                            placeholder="e.g. 09:30 AM"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={newSlotTime}
                            onChange={(e) => setNewSlotTime(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={savingSlot || !newSlotTime}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {savingSlot ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                            Add
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {loadingSlots && slots.length === 0 ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Loading slots...
                            </div>
                        ) : (
                            [...slots].sort((a, b) => {
                                const parseTime = (t: string) => {
                                    const [time, modifier] = t.split(' ');
                                    let [hours, minutes] = time.split(':').map(Number);
                                    if (modifier === 'PM' && hours !== 12) hours += 12;
                                    if (modifier === 'AM' && hours === 12) hours = 0;
                                    return hours * 60 + (minutes || 0);
                                };
                                return parseTime(a.time) - parseTime(b.time);
                            }).map(slot => (
                                <div key={slot.id} className="group relative bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 flex items-center gap-3 pr-2 shadow-sm hover:shadow-md transition-all">
                                    <span className="text-xs font-bold text-gray-700">{slot.time}</span>
                                    <button
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        disabled={deletingId === slot.id}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                        title="Remove Slot"
                                    >
                                        {deletingId === slot.id ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Trash2 size={12} />}
                                    </button>
                                </div>
                            ))
                        )}
                        {!loadingSlots && slots.length === 0 && (
                            <div className="text-xs text-gray-400 italic">No slots added yet.</div>
                        )}
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start px-4 sm:px-0">
                {/* Main Timeline Column */}
                <div className="xl:col-span-8 flex flex-col gap-4 relative min-h-[400px]">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule timeline</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Confirmed</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold text-gray-400 uppercase">Pending</span></div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <TimelineSkeleton />
                            ) : filteredSlots.length > 0 ? filteredSlots.map((slot) => {
                                const slotBookings = bookings.filter(b => {
                                    const matchedTime = normalizeTime(b.preferred_time) === normalizeTime(slot.time);
                                    if (!matchedTime) return false;

                                    if (selectedVets.includes('all')) return true;
                                    if (!b.vet_id) return false;
                                    return selectedVets.includes(b.vet_id.toString());
                                });

                                return (
                                    <div key={slot.id} className="flex h-20 group hover:bg-gray-50/50 transition-colors">
                                        <div className="w-24 border-r border-gray-50 flex items-center justify-center bg-gray-50/20">
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">{slot.time}</span>
                                        </div>

                                        <div className="flex-1 flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x no-scrollbar">
                                            {slotBookings.length > 0 ? (
                                                slotBookings.map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className={`flex-none w-[200px] sm:w-[220px] snap-start h-full p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group/card ${booking.status === 'confirmed'
                                                                ? 'bg-emerald-50/20 border-emerald-100/50 hover:bg-emerald-50/40'
                                                                : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <span className="text-xl group-hover/card:scale-110 transition-transform">{getIconForPet(booking.pet_type)}</span>
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-bold text-gray-800 truncate leading-tight mb-0.5">{booking.pet_name}</div>
                                                                <div className="text-[10px] font-medium text-gray-400 truncate tracking-tight">{booking.vets?.name || 'Unassigned'}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`w-1.5 h-8 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-20 text-center">
                                    <Clock className="text-gray-100 mx-auto mb-4" size={48} />
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No slots available for this period.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Insights Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
                            Summary
                        </h3>
                        {loading ? (
                            <SummarySkeleton />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-tight">Total Bookings</div>
                                        <div className="text-2xl font-black text-gray-800">{filteredBookings.length}</div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-tight">Capacity Used</div>
                                        <div className="text-2xl font-black text-gray-800">{occupancyRate}%</div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Clinic Progress</span>
                                        <span className="text-[10px] text-primary font-bold">{occupancyRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${occupancyRate}%` }}></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Queue Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Confirmed Queue</h3>
                        <div className="space-y-3">
                            {loading ? (
                                <QueueSkeleton />
                            ) : filteredBookings.filter(b => b.status === 'confirmed').slice(0, 5).map(b => (
                                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg border border-gray-100">
                                            {getIconForPet(b.pet_type)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800">{b.pet_name}</div>
                                            <div className="text-[10px] text-gray-500 font-medium">{b.preferred_time}</div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                                        <Clock size={14} />
                                    </div>
                                </div>
                            ))}
                            {bookings.filter(b => b.status === 'confirmed').length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-[10px] text-gray-300 font-bold uppercase italic tracking-widest">Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    vets={vets}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={handleUpdateBooking}
                    isLoading={updatingBooking}
                    getIcon={getIconForPet}
                />
            )}
        </div>
    );
}

function SummarySkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center mb-2">
                    <div className="h-2 w-24 bg-gray-100 rounded"></div>
                    <div className="h-2 w-8 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2"></div>
            </div>
        </div>
    );
}

function QueueSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                        <div className="space-y-2">
                            <div className="h-2 w-20 bg-gray-100 rounded"></div>
                            <div className="h-2 w-12 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex h-20 items-center border-b border-gray-50">
                    <div className="w-24 h-full border-r border-gray-50 bg-gray-50/10 flex items-center justify-center">
                        <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex-1 px-4 flex gap-3">
                        <div className="h-14 w-48 bg-gray-50 rounded-2xl"></div>
                        <div className="h-14 w-48 bg-gray-50 rounded-2xl hidden sm:block"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function BookingDetailsModal({ booking, vets, onClose, onUpdate, isLoading, getIcon }: any) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Modal Header */}
                <div className="p-8 pb-6 flex items-start justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50/50 border border-blue-100 flex items-center justify-center text-3xl">
                            {getIcon(booking.pet_type)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-gray-800">{booking.pet_name}</h2>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                {booking.breed || booking.pet_type} • {booking.age || 'Age N/A'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    {/* Time Slot Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <CalendarIcon size={18} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Date</span>
                                <span className="text-sm font-black text-gray-800">{booking.preferred_date}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Clock size={18} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Time Slot</span>
                                <span className="text-sm font-black text-gray-800">{booking.preferred_time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Owner</span>
                            <span className="font-black text-gray-800">{booking.owner_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Contact</span>
                            <span className="font-black text-gray-800">{booking.phone || booking.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Visit Reason</span>
                            <span className="font-black text-gray-800">{booking.visit_reason}</span>
                        </div>
                        <div className="pt-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-3 block pl-1">Assign Specialist</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-gray-800 outline-none focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                                    value={booking.vet_id || ''}
                                    onChange={(e) => onUpdate(booking.id, { vet_id: e.target.value ? parseInt(e.target.value) : null })}
                                    disabled={isLoading}
                                >
                                    <option value="">Unassigned</option>
                                    {vets.map((vet: any) => (
                                        <option key={vet.id} value={vet.id}>{vet.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        {booking.status === 'confirmed' ? (
                            <button
                                onClick={() => onUpdate(booking.id, { status: 'cancelled' })}
                                disabled={isLoading}
                                className="w-full py-4 text-xs font-black text-red-500 bg-red-50 rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {isLoading ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : 'Cancel Booking'}
                            </button>
                        ) : booking.status === 'pending' ? (
                            <>
                                <button
                                    onClick={() => onUpdate(booking.id, { status: 'cancelled' })}
                                    disabled={isLoading}
                                    className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : 'Cancel'}
                                </button>
                                <button
                                    onClick={() => onUpdate(booking.id, { status: 'confirmed' })}
                                    disabled={isLoading}
                                    className="flex-[2] py-4 text-xs font-black text-white bg-primary rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                                    Approve Booking
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onUpdate(booking.id, { status: 'pending' })}
                                disabled={isLoading}
                                className="w-full py-4 text-xs font-black text-primary bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all uppercase tracking-widest"
                            >
                                {isLoading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : 'Restore to Pending'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalendarPopover({ selectedDate, onSelect, dayCounts, onClose }: { selectedDate: string, onSelect: (date: string) => void, dayCounts: Record<string, number>, onClose: () => void }) {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const changeMonth = (delta: number) => {
        const next = new Date(viewDate);
        next.setMonth(next.getMonth() + delta);
        setViewDate(next);
    };

    return (
        <div className="absolute top-full left-0 mt-3 z-50 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 w-[350px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400">
                        <ChevronLeft size={16} />
                    </button>
                    <h4 className="font-black text-gray-800 tracking-tight min-w-[120px] text-center">
                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400">
                        <ChevronRight size={16} />
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-black text-gray-300 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} className="p-2"></div>;

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = dayCounts[dateStr] || 0;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onSelect(dateStr)}
                            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-blue-100'
                                    : isToday ? 'bg-gray-100 text-gray-900 font-black' : 'hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span className="text-xs font-bold">{day}</span>
                            {count > 0 && (
                                <span className={`text-[8px] font-black mt-0.5 ${isSelected ? 'text-white/80' : 'text-primary'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <button
                    onClick={() => onSelect(new Date().toISOString().split('T')[0])}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                    Go to Today
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Booking count</span>
                </div>
            </div>
        </div>
    );
}

function FiltersPopover({ vets, selectedVets, toggleVet, timeFilter, setTimeFilter, onClose }: any) {
    return (
        <div className="absolute top-20 right-0 z-50 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 w-[350px] animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-gray-800 tracking-tight text-lg">Schedule Filters</h4>
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-8">
                {/* Time View Section */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-3 block">Time Horizon</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['all', 'morning', 'afternoon'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTimeFilter(f)}
                                className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all text-center ${timeFilter === f ? 'bg-primary text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                {f === 'all' ? 'Full Day' : f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Veterinarians Section */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-3 block">Specialists</label>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar scrollbar-hide">
                        <button
                            onClick={() => toggleVet('all')}
                            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between ${selectedVets.includes('all') ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <span>Display All</span>
                            {selectedVets.includes('all') && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </button>

                        {vets.map((v: any) => {
                            const isSelected = selectedVets.includes(v.id.toString());
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => toggleVet(v.id.toString())}
                                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${isSelected ? 'bg-primary/5 text-primary border-primary/20 border' : 'bg-gray-50 text-gray-700 border-transparent border hover:bg-gray-100'}`}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color || '#3b82f6' }}></div>
                                    <span className="flex-1">{v.name}</span>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
                <button
                    onClick={onClose}
                    className="w-full bg-gray-900 text-white py-3 rounded-2xl text-xs font-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-100"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}
