'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Stethoscope, Clock, DollarSign } from 'lucide-react';
import { Service } from '@/lib/schemas';

export default function ServicesSettingsPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        description: '',
        duration: '',
        price: 0,
        is_active: true,
        icon_name: 'Stethoscope',
        image_url: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                setServices(data || []);
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to fetch services');
            }
        } catch (err) {
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const method = editingService ? 'PATCH' : 'POST';
        const body = editingService ? { ...formData, id: editingService.id } : formData;

        try {
            const res = await fetch('/api/services', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchServices();
                resetForm();
            } else {
                const errData = await res.json();
                setError(errData.error || 'Error saving service');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        
        try {
            const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchServices();
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to delete service');
            }
        } catch (err) {
            setError('Failed to delete service');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', duration: '', price: 0, is_active: true });
        setIsAddModalOpen(false);
        setEditingService(null);
    };

    const openEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
            is_active: service.is_active,
            icon_name: (service as any).icon_name || 'Stethoscope',
            image_url: (service as any).image_url || ''
        });
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-[#009ad4] transition-all"
                >
                    <Plus size={18} />
                    Add Service
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100 shadow-sm" />
                    ))}
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Stethoscope size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">No Services Yet</h3>
                    <p className="text-gray-400 mt-1">Start by adding your first clinic service.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {(service as any).icon_name === 'Syringe' ? <Loader2 size={24} className="animate-pulse" /> : <Stethoscope size={24} />}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEdit(service)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(service.id!)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{service.name}</h3>
                                    {!service.is_active && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                    {service.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                {service.duration && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-blue-200" />
                                        <span>{service.duration}</span>
                                    </div>
                                )}
                                {service.price && service.price > 0 && (
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <DollarSign size={14} className="text-emerald-200" />
                                        <span className="text-emerald-600 font-black">${service.price}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Service Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Wellness Exam"
                                        className="w-full text-base bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                                    <textarea
                                        placeholder="Describe what this service covers..."
                                        className="w-full text-base bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 outline-none transition-all h-24 resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Icon (Lucide Name)</label>
                                        <select
                                            className="w-full text-base bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                            value={formData.icon_name}
                                            onChange={e => setFormData({ ...formData, icon_name: e.target.value })}
                                        >
                                            <option value="Stethoscope">Stethoscope</option>
                                            <option value="Syringe">Syringe</option>
                                            <option value="Scissors">Scissors</option>
                                            <option value="Activity">Activity</option>
                                            <option value="Microscope">Microscope</option>
                                            <option value="Ambulance">Ambulance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Image URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            className="w-full text-base bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                            value={(formData as any).image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        className="w-5 h-5 text-primary rounded-lg border-gray-200"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Service is currently active</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.name}
                                    className="flex-[2] py-4 text-xs font-black text-white bg-primary rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    {editingService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
