'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';


export default function AppointmentsPage() {
    const [filter, setFilter] = useState('All');

    const appointments = [
        { id: 1, pet: "Max", breed: "Golden Retriever", owner: "Sarah J.", type: "Wellness Exam", date: "Oct 24", time: "10:00 AM", status: "Confirmed", vet: "Dr. Smith", img: "🐶" },
        { id: 2, pet: "Bella", breed: "Siamese Cat", owner: "John D.", type: "Vaccination", date: "Oct 24", time: "11:30 AM", status: "Pending", vet: "Unassigned", img: "🐱" },
        { id: 3, pet: "Luna", breed: "Rabbit", owner: "Mike T.", type: "Dental Checkup", date: "Oct 25", time: "09:00 AM", status: "Confirmed", vet: "Dr. Jones", img: "🐰" },
        { id: 4, pet: "Rocky", breed: "Bulldog", owner: "Emily R.", type: "Surgery Consult", date: "Oct 26", time: "02:00 PM", status: "Cancelled", vet: "Dr. Smith", img: "🐕" },
        { id: 5, pet: "Charlie", breed: "Parrot", owner: "David W.", type: "Grooming", date: "Oct 26", time: "04:30 PM", status: "Confirmed", vet: "Staff", img: "🦜" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage bookings and schedule.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm text-sm font-medium"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2">
                        <Plus size={16} /> New Appointment
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl border border-blue-100">
                                    {apt.img}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{apt.pet}</h3>
                                    <p className="text-xs text-gray-500 font-medium">{apt.breed}</p>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${apt.status === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                apt.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                    'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {apt.status}
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Calendar size={18} />
                                    <span className="font-medium text-gray-700">{apt.date}</span>
                                </div>

                                <div className="w-px h-4 bg-gray-200"></div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Clock size={18} />
                                    <span className="font-medium text-gray-700">{apt.time}</span>
                                </div>

                            </div>

                            <div className="px-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Service</span>
                                    <span className="font-semibold text-gray-700">{apt.type}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Owner</span>
                                    <span className="font-semibold text-gray-700">{apt.owner}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Vet</span>
                                    <span className={`font-semibold ${apt.vet === 'Unassigned' ? 'text-orange-500 italic' : 'text-gray-700'}`}>{apt.vet}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                            <button className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                Edit
                            </button>
                            {apt.status === 'Pending' ? (
                                <button className="flex-1 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 shadow-sm shadow-green-200 transition-colors">
                                    Approve
                                </button>
                            ) : (
                                <button className="flex-1 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                    Details
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder (Optional, similar to Vets page style) */}
                <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary/50 hover:bg-blue-50/30 hover:text-primary transition-all min-h-[300px] group">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                        <Plus size={24} />
                    </div>

                    <span className="font-semibold">Book New Appointment</span>
                    <span className="text-xs mt-1 opacity-70">Walk-in or phone call</span>
                </button>
            </div>
        </div>
    );
}
