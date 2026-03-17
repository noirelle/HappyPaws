'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Shield, Ban, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', first_name: '', last_name: '', role_id: 3 }); // Default to Vet
    const [roles, setRoles] = useState<any[]>([]);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState<{id: string, updates: any} | null>(null);
    const [errorModal, setErrorModal] = useState<{show: boolean, message: string}>({show: false, message: ''});

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        const res = await fetch('/api/roles');
        const data = await res.json();
        if (res.ok) setRoles(data);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData)
            });
            if (res.ok) {
                setShowInviteForm(false);
                setInviteData({ email: '', first_name: '', last_name: '', role_id: 3 });
                fetchUsers();
            } else {
                setErrorModal({show: true, message: 'Failed to invite user. Please try again later.'});
            }
        } catch (error) {
            console.error('Invite error', error);
        }
    };

    const handleStatusChange = async (id: string, updates: any) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error('Update error', error);
        } finally {
            setIsConfirmOpen(false);
            setUserToUpdate(null);
        }
    };

    const handleBanClick = (id: string, updates: any) => {
        if (updates.is_banned === true) {
            setUserToUpdate({id, updates});
            setIsConfirmOpen(true);
        } else {
            handleStatusChange(id, updates);
        }
    };

    if (loading && users.length === 0) {
        return <UsersSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1" />
                <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Invite User
                </button>
            </div>

            {showInviteForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold mb-4">Invite New User</h3>
                    <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="First Name"
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={inviteData.first_name} onChange={e => setInviteData({ ...inviteData, first_name: e.target.value })}
                            required
                        />
                        <input
                            type="text" placeholder="Last Name"
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={inviteData.last_name} onChange={e => setInviteData({ ...inviteData, last_name: e.target.value })}
                            required
                        />
                        <input
                            type="email" placeholder="Email"
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                            required
                        />
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={inviteData.role_id} onChange={e => setInviteData({ ...inviteData, role_id: Number(e.target.value) })}
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowInviteForm(false)} className="text-gray-500 bg-white hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5">Cancel</button>
                            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Send Invitation</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Role</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Joined</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8">No users found.</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.first_name?.[0]}{user.last_name?.[0] || user.email?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">{user.first_name} {user.last_name}</span>
                                                <span className="text-xs text-gray-400 font-normal">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                            {user.roles?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {user.is_banned ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-md w-fit">
                                                    <Ban size={12} /> Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-md w-fit">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            )}
                                            {!user.is_approved && !user.is_banned && (
                                                <span className="inline-flex items-center gap-1 text-orange-600 font-medium text-xs bg-orange-50 px-2 py-1 rounded-md w-fit">
                                                    <Shield size={12} /> Pending Approval
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!user.is_approved && (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, { is_approved: true })}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleBanClick(user.id, { is_banned: !user.is_banned })}
                                                className={`p-2 rounded-lg transition-colors ${user.is_banned ? 'text-gray-500 hover:bg-gray-100' : 'text-red-500 hover:bg-red-50'}`}
                                                title={user.is_banned ? "Unban" : "Ban"}
                                            >
                                                {user.is_banned ? <Shield size={18} /> : <Ban size={18} />}
                                            </button>
                                            {/* Edit Role would go here, maybe a dropdown or modal */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function UsersSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-end pt-2">
                <div className="h-10 bg-gray-900 rounded-lg w-32"></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-14 bg-gray-50/50 border-b border-gray-100 flex items-center px-6 gap-8">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-20"></div>)}
                </div>
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="px-6 py-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-50 rounded w-1/3"></div>
                            </div>
                            <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                            <div className="h-6 bg-gray-100 rounded w-16"></div>
                            <div className="h-8 bg-gray-100 rounded w-24"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
