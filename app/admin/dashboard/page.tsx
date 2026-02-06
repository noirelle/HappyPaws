'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Filter, Search } from 'lucide-react';


export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        upcomingCount: 0,
        pendingCount: 0,
        totalClients: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hello, Dr. Admin!</h1>
                    <p className="text-gray-500 mt-1 max-w-md">Here is what is happening with your clinic today.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Upcoming Bookings', value: stats.upcomingCount || 0, icon: '📅', text: 'text-yellow-600', iconBg: 'bg-yellow-100' },
                    { label: 'Pending Requests', value: stats.pendingCount || 0, icon: '⏳', text: 'text-blue-600', iconBg: 'bg-blue-100' },
                    { label: 'Total Clients', value: stats.totalClients, icon: '👥', text: 'text-green-600', iconBg: 'bg-green-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full ${stat.iconBg} ${stat.text} flex items-center justify-center text-xl`}>
                                {stat.icon}
                            </div>
                            <div>
                                <h3 className="text-gray-500 font-medium text-sm mb-1">{stat.label}</h3>
                                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={24} />
                        </button>

                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-100">
                    <div className="flex gap-8 overflow-x-auto px-6 py-4 scrollbar-hide">
                        {[
                            { name: 'View All', count: (stats.upcomingCount || 0) + (stats.pendingCount || 0), active: true },
                            { name: 'Pending', count: stats.pendingCount || 0, active: false },
                            { name: 'Upcoming', count: stats.upcomingCount || 0, active: false },
                        ].map(tab => (
                            <button
                                key={tab.name}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${tab.active
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.name}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${tab.active ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between bg-[#FCFCFD]">
                    <div className="relative flex-1 max-w-md w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>

                        <input
                            type="text"
                            placeholder="Search appointments..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
                        <Filter size={16} />
                        Filter
                    </button>

                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
                        <thead className="bg-[#F8F9FB] text-gray-500 font-medium border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-4">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                </th>
                                <th className="px-6 py-4">Pet / Owner</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentActivity?.map((row: any, i: number) => (
                                <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{row.pet_name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{row.owner_name}</div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-700">{row.visit_reason}</td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-transparent 
                                ${row.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                                                row.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-gray-900">{row.preferred_date}</div>
                                        <div className="text-xs text-gray-400">{row.preferred_time}</div>
                                    </td>
                                </tr>
                            ))}
                            {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No recent activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
