'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ConfirmationModal from '@/app/components/ui/ConfirmationModal';

export default function VetsPage() {
    const [vets, setVets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [vetToDelete, setVetToDelete] = useState<number | null>(null);
    const [editingVetId, setEditingVetId] = useState<number | null>(null);
    const [newVet, setNewVet] = useState({
        name: '',
        specialty: '',
        status: 'Available',
        patients: 0,
        experience: '',
        image: ''
    });

    const fetchVets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vets');
            if (res.ok) {
                const data = await res.json();
                setVets(data);
            }
        } catch (error) {
            console.error('Failed to fetch vets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVets();
    }, []);

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setNewVet({ name: '', specialty: '', status: 'Available', patients: 0, experience: '', image: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (vet: any) => {
        setIsEditMode(true);
        setEditingVetId(vet.id);
        setNewVet({
            name: vet.name,
            specialty: vet.specialty,
            status: vet.status,
            patients: vet.patients,
            experience: vet.experience,
            image: vet.image
        });
        setIsModalOpen(true);
    };

    const handleSaveVet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/vets';
            const method = isEditMode ? 'PATCH' : 'POST';
            const body = isEditMode 
                ? { id: editingVetId, ...newVet }
                : { ...newVet, image: newVet.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setNewVet({ name: '', specialty: '', status: 'Available', patients: 0, experience: '', image: '' });
                fetchVets();
            }
        } catch (error) {
            console.error('Failed to save vet', error);
        }
    };

    const handleDeleteVet = async () => {
        if (!vetToDelete) return;
        try {
            const res = await fetch(`/api/vets?id=${vetToDelete}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchVets();
            }
        } catch (error) {
            console.error('Failed to delete vet', error);
        }
    };

    if (loading && vets.length === 0) {
        return <VetsSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1" />
                <button 
                    onClick={handleOpenAdd}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Add Veterinarian
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vets.map((vet) => (
                    <div key={vet.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                                {vet.image || 'V'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${vet.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' :
                                vet.status === 'On Leave' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                                    'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                {vet.status}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{vet.name}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4">{vet.specialty}</p>

                        <div className="flex items-center gap-4 py-4 border-t border-gray-50">
                            <div>
                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Patients</div>
                                <div className="font-bold text-gray-800">{vet.patients}</div>
                            </div>
                            <div className="w-px h-8 bg-gray-100"></div>
                            <div>
                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Experience</div>
                                <div className="font-bold text-gray-800">{vet.experience}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                View Profile
                            </button>
                            <button 
                                onClick={() => handleOpenEdit(vet)}
                                className="px-3 py-2 text-gray-400 hover:text-primary bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors" 
                                title="Edit"
                            >
                                <Pencil size={20} />
                            </button>
                            <button 
                                onClick={() => {
                                    setVetToDelete(vet.id);
                                    setIsConfirmOpen(true);
                                }}
                                className="px-3 py-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded-lg hover:border-red-200 transition-colors" 
                                title="Delete"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleOpenAdd}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary/50 hover:bg-blue-50/30 hover:text-primary transition-all min-h-[280px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Plus size={32} />
                    </div>
                    <span className="font-semibold">Add New Specialist</span>
                </button>
            </div>

            {/* Add Vet Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Specialist' : 'Assign New Specialist'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveVet} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition-all"
                                    value={newVet.name}
                                    onChange={e => setNewVet({...newVet, name: e.target.value})}
                                    placeholder="Dr. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition-all"
                                    value={newVet.specialty}
                                    onChange={e => setNewVet({...newVet, specialty: e.target.value})}
                                    placeholder="e.g. Veterinary Surgeon"
                                />
                            </div>
                            {isEditMode && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Patients Handled</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition-all"
                                        value={newVet.patients}
                                        onChange={e => setNewVet({...newVet, patients: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition-all"
                                        value={newVet.experience}
                                        onChange={e => setNewVet({...newVet, experience: e.target.value})}
                                        placeholder="e.g. 10 Years"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select 
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-primary outline-none transition-all bg-white"
                                        value={newVet.status}
                                        onChange={e => setNewVet({...newVet, status: e.target.value})}
                                    >
                                        <option>Available</option>
                                        <option>Busy</option>
                                        <option>On Leave</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-4 shadow-lg hover:bg-[#009ad4] transition-all"
                            >
                                {isEditMode ? 'Update Specialist' : 'Add Specialist'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteVet}
                title="Delete Specialist"
                message="Are you sure you want to remove this veterinarian? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}

function VetsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-end">
                <div className="h-10 bg-gray-900 rounded-lg w-44"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-72 flex flex-col">
                        <div className="flex justify-between mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100"></div>
                            <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="h-5 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                        </div>
                        <div className="flex gap-4 py-4 border-t border-gray-50 flex-1">
                            <div className="space-y-1 flex-1">
                                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            </div>
                            <div className="w-px h-8 bg-gray-50"></div>
                            <div className="space-y-1 flex-1">
                                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="h-10 bg-gray-50 rounded-lg mt-4 w-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
