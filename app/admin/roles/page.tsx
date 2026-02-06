'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, Check, Trash2 } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', permissions: [] as string[] });

    // Mock permissions list for MVP
    const AVAILABLE_PERMISSIONS = ['manage_users', 'manage_appointments', 'view_reports', 'manage_content', 'manage_vets'];

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/roles');
            const data = await res.json();
            if (res.ok) setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRole)
            });
            if (res.ok) {
                setShowAddForm(false);
                setNewRole({ name: '', permissions: [] });
                fetchRoles();
            }
        } catch (error) {
            console.error('Create role error', error);
        }
    };

    const togglePermission = (perm: string) => {
        setNewRole(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Role Management</h1>
                    <p className="text-gray-500 mt-1">Define roles and access permissions.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Create Role
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold mb-4">Create New Role</h3>
                    <form onSubmit={handleCreateRole} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Role Name</label>
                            <input
                                type="text" placeholder="e.g. Clinic Manager"
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Permissions</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <button
                                        key={perm}
                                        type="button"
                                        onClick={() => togglePermission(perm)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${newRole.permissions.includes(perm)
                                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {newRole.permissions.includes(perm) && <Check size={12} />}
                                        {perm.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-500 bg-white hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5">Cancel</button>
                            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Create Role</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Shield size={20} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Permissions</p>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                                    typeof role.permissions === 'string' ? JSON.parse(role.permissions).map((p: string) => (
                                        <span key={p} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                                            {p.replace('_', ' ')}
                                        </span>
                                    )) : role.permissions.map((p: string) => (
                                        <span key={p} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                                            {p.replace('_', ' ')}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No permissions set</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
