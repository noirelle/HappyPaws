'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Heart, MessageSquare, ChevronRight, User, ExternalLink, X, Clock, FileText, Activity } from 'lucide-react';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [noteContent, setNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            setNoteContent(selectedClient.adminNotes || '');
        } else {
            setNoteContent('');
        }
    }, [selectedClient]);

    const handleSaveNote = async () => {
        if (!selectedClient) return;
        setSavingNote(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: selectedClient.email, note: noteContent })
            });
            if (res.ok) {
                // Update local state
                const updatedClients = clients.map(c => 
                    c.email === selectedClient.email ? { ...c, adminNotes: noteContent } : c
                );
                setClients(updatedClients);
                setSelectedClient({ ...selectedClient, adminNotes: noteContent });
            }
        } catch (error) {
            console.error('Failed to save note', error);
        } finally {
            setSavingNote(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const query = searchQuery.toLowerCase();
        return (
            client.name?.toLowerCase().includes(query) ||
            client.email?.toLowerCase().includes(query) ||
            client.pets?.some((p: any) => p.name?.toLowerCase().includes(query))
        );
    });

    const getPetEmoji = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('dog')) return '🐶';
        if (t.includes('cat')) return '🐱';
        if (t.includes('bird') || t.includes('parrot')) return '🦜';
        if (t.includes('rabbit')) return '🐰';
        return '🐾';
    };

    if (loading && clients.length === 0) {
        return <ClientsSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Header section with search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1" />
                
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search owners, pets, or emails..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clients', value: clients.length, icon: User, color: 'blue' },
                    { label: 'Active Pets', value: clients.reduce((acc, c) => acc + c.pets.length, 0), icon: Heart, color: 'rose' },
                    { label: 'Recurring Clients', value: clients.filter(c => c.visitCount > 1).length, icon: MessageSquare, color: 'amber' },
                    { label: 'Loyalty Clients', value: clients.filter(c => c.visitCount >= 3).length, icon: Heart, color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Clients List/Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredClients.map((client) => (
                    <div key={client.email} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        {/* Loyalty Badge */}
                        {client.visitCount >= 3 && (
                            <div className="absolute top-0 right-0 px-4 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl border-b border-l border-amber-200">
                                Loyalty Tier
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                                    <User className="text-gray-400 group-hover:text-primary transition-colors" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 leading-none">{client.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <a href={`mailto:${client.email}`} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                                            <Mail size={12} /> {client.email}
                                        </a>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <a href={`tel:${client.phone}`} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                                            <Phone size={12} /> {client.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pets Section */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Pets Info</h4>
                            <div className="flex flex-wrap gap-2">
                                {client.pets.map((pet: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors cursor-default">
                                        <span className="text-lg">{getPetEmoji(pet.type)}</span>
                                        <div>
                                            <div className="text-xs font-bold text-gray-700 leading-none">{pet.name}</div>
                                            <div className="text-[9px] text-gray-400 font-medium">{pet.breed || pet.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Visits</div>
                                <div className="text-sm font-bold text-gray-800 flex items-baseline gap-1">
                                    {client.visitCount} 
                                    <span className="text-[10px] font-normal text-gray-400">apps</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Latest Status</div>
                                <div className={`text-xs font-bold uppercase ${
                                    client.status === 'confirmed' ? 'text-emerald-500' : 
                                    client.status === 'pending' ? 'text-amber-500' : 'text-gray-400'
                                }`}>
                                    {client.status}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Pref. Specialist</div>
                                <div className="text-xs font-bold text-gray-700 line-clamp-1">
                                    {client.preferredVet}
                                </div>
                            </div>
                        </div>

                        {client.adminNotes && (
                            <div className="mt-4 p-3 bg-blue-50/30 border border-blue-100/50 rounded-xl">
                                <div className="text-[10px] uppercase text-blue-400 font-bold mb-1 flex items-center gap-1">
                                    <MessageSquare size={10} /> Internal Note
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 italic">"{client.adminNotes}"</p>
                            </div>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button 
                                onClick={() => setSelectedClient(client)}
                                className="flex-1 py-2 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                View Detailed History <ChevronRight size={14} />
                            </button>
                            <button className="px-3 py-2 text-gray-400 hover:text-primary bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-all" title="External Link">
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
                        <div className="text-4xl mb-4 text-gray-300 flex justify-center"><Search size={48} /></div>
                        <h3 className="text-lg font-bold text-gray-800">No clients found</h3>
                        <p className="text-gray-400 text-sm">Try searching for a different name, email or pet.</p>
                    </div>
                )}
            </div>

            {/* Detailed History Modal */}
            {selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedClient.name}</h2>
                                    <p className="text-sm text-gray-500 font-medium">Medical & Appointment Records</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Summary Cards in Modal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                    <div className="text-[10px] uppercase font-bold text-blue-400 mb-1">Total Appointments</div>
                                    <div className="text-2xl font-black text-blue-600">{selectedClient.visitCount}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Reliability Score</div>
                                    <div className="text-2xl font-black text-emerald-600">
                                        {Math.min(100, (selectedClient.fullHistory.filter((h: any) => h.status === 'confirmed').length / selectedClient.visitCount) * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                                    <div className="text-[10px] uppercase font-bold text-purple-400 mb-1">Registered Pets</div>
                                    <div className="text-2xl font-black text-purple-600">{selectedClient.pets.length}</div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Activity className="text-primary" size={20} /> Appointment Timeline
                                </h3>
                                
                                <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-8 pb-4">
                                    {selectedClient.fullHistory.map((visit: any, idx: number) => (
                                        <div key={visit.id} className="relative">
                                            {/* dot */}
                                            <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 border-white bg-primary shadow-sm"></div>
                                            
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">{getPetEmoji(selectedClient.pets.find((p: any) => p.name === visit.pet_name)?.type)}</div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{visit.pet_name}</div>
                                                            <div className="text-xs text-gray-500 font-medium">{visit.visit_reason}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-xs font-bold text-gray-800">{visit.date}</div>
                                                            <div className="text-[10px] text-gray-400">{visit.time}</div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                                            visit.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                                                            visit.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                                        }`}>
                                                            {visit.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {visit.symptoms && (
                                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Symptoms Reported</div>
                                                        <p className="text-sm text-gray-600 italic whitespace-pre-wrap">"{visit.symptoms}"</p>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-primary flex items-center justify-center text-[10px] font-bold">
                                                            {visit.vet?.split(' ').map((n: string) => n[0]).join('') || 'V'}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500">Seen by {visit.vet || 'Unassigned'}</span>
                                                    </div>
                                                    
                                                    {idx === 0 && (
                                                        <div className="flex gap-2">
                                                            <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-bold flex items-center gap-1">
                                                                <Activity size={10} /> Vaccination Due soon
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Internal Notes Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MessageSquare className="text-gray-400" size={18} /> Internal Admin Notes
                                </h3>
                                <textarea 
                                    placeholder="Add private notes about this client (e.g., 'Aggressive pet', 'Prefers morning calls')..."
                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px] resize-none transition-all"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    disabled={savingNote}
                                ></textarea>
                                <div className="mt-2 flex justify-end">
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={savingNote || noteContent === (selectedClient.adminNotes || '')}
                                        className="px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {savingNote ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                                        {savingNote ? 'Saving...' : 'Save Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Close Records
                            </button>
                            <button 
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-[#009ad4] transition-all shadow-lg flex items-center gap-2"
                            >
                                <Mail size={18} /> Send Medical Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ClientsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-end">
                <div className="h-10 bg-gray-50 rounded-xl w-full max-w-md"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 h-20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-80 flex flex-col">
                        <div className="flex gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100"></div>
                            <div className="space-y-2 py-1 flex-1">
                                <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="h-10 bg-gray-50 rounded-lg"></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-10 bg-gray-50 rounded-lg"></div>
                                <div className="h-10 bg-gray-50 rounded-lg"></div>
                                <div className="h-10 bg-gray-50 rounded-lg"></div>
                            </div>
                        </div>
                        <div className="h-10 bg-gray-900 rounded-lg mt-6"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
