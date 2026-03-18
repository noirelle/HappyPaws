'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Gift, Palette } from 'lucide-react';
import { CarePackage } from '@/lib/schemas';

export default function PackagesSettingsPage() {
    const [packages, setPackages] = useState<CarePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<CarePackage | null>(null);
    const [formData, setFormData] = useState<Partial<CarePackage>>({
        icon: '🐶',
        title: '',
        description: '',
        discount: '',
        color: 'bg-blue-50 text-blue-600',
        discount_color: 'bg-primary',
        is_active: true
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages');
            if (res.ok) {
                const data = await res.json();
                setPackages(data || []);
            }
        } catch (err) {
            setError('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const method = editingPackage ? 'PATCH' : 'POST';
        const body = editingPackage ? { ...formData, id: editingPackage.id } : formData;

        try {
            const res = await fetch('/api/packages', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchPackages();
                resetForm();
            } else {
                const errData = await res.json();
                setError(errData.error?.message || 'Error saving package');
            }
        } catch (err) {
            setError('Server connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            const res = await fetch(`/api/packages?id=${id}`, { method: 'DELETE' });
            if (res.ok) await fetchPackages();
        } catch (err) {
            setError('Failed to delete package');
        }
    };

    const resetForm = () => {
        setFormData({ icon: '🐶', title: '', description: '', discount: '', color: 'bg-blue-50 text-blue-600', discount_color: 'bg-primary', is_active: true });
        setIsAddModalOpen(false);
        setEditingPackage(null);
    };

    const openEdit = (pkg: CarePackage) => {
        setEditingPackage(pkg);
        setFormData(pkg);
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-[#009ad4] transition-all"
                >
                    <Plus size={18} /> Add Package
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
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 shadow-sm" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-16 h-16 rounded-2xl ${pkg.color} flex items-center justify-center text-3xl shadow-sm group-hover:rotate-6 transition-transform`}>
                                    {pkg.icon}
                                </div>
                                <div className="flex items-center gap-1 z-10">
                                    <button onClick={() => openEdit(pkg)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(pkg.id!)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-xl mb-2">{pkg.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                                    {pkg.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className={`px-4 py-2 rounded-full text-white text-xs font-bold ${pkg.discount_color}`}>
                                    {pkg.discount}
                                </span>
                                {!pkg.is_active && <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Inactive</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetForm}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                {editingPackage ? 'Edit Package' : 'New Care Package'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Icon</label>
                                    <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-center text-2xl focus:ring-4 focus:ring-blue-100 outline-none"
                                        value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Package Title</label>
                                    <input required placeholder="e.g. Puppy Kit" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-100 outline-none"
                                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                                <textarea rows={3} placeholder="What is included?" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tag Line/Price</label>
                                    <input placeholder="e.g. Save 20%" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-100 outline-none"
                                        value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Active</label>
                                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <input type="checkbox" id="pkg_active" className="w-5 h-5 rounded text-primary"
                                            checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                        <label htmlFor="pkg_active" className="text-sm font-bold text-gray-700">Display Live</label>
                                    </div>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Icon BG color</label>
                                    <input placeholder="bg-blue-50 text-blue-600" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-mono"
                                        value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tag color</label>
                                    <input placeholder="bg-primary" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-mono"
                                        value={formData.discount_color} onChange={e => setFormData({ ...formData, discount_color: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="animate-spin" /> : <Check />}
                                {editingPackage ? 'Update Package' : 'Create Package'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
