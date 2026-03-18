'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/sidebar/Sidebar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Menu, PanelLeft } from 'lucide-react';

const ROUTE_CONFIG: Record<string, { title: string, subtitle: string }> = {
    '/admin/dashboard': { title: 'Hello, Dr. Admin!', subtitle: 'Here is what is happening with your clinic today.' },
    '/admin/appointments': { title: 'Appointments', subtitle: 'Manage bookings and schedule.' },
    '/admin/vets': { title: 'Veterinary Team', subtitle: 'Manage your team of experts and specialists.' },
    '/admin/clients': { title: 'Clients & Pets', subtitle: 'Manage owner profiles and their pet histories.' },
    '/admin/users': { title: 'User Management', subtitle: 'Manage system access, permissions, and security.' },
    '/admin/roles': { title: 'Role Management', subtitle: 'Configure system roles and granular permissions.' },
    '/admin/settings': { title: 'System Settings', subtitle: 'Configure global application preferences and integrations.' },
    '/admin/settings/schedule': { title: 'Clinic Schedule', subtitle: 'Manage live timeline and availability.' },
    '/admin/settings/services': { title: 'Clinic Services', subtitle: 'Manage dynamic services and offerings.' },
    '/admin/settings/packages': { title: 'Total Care Packages', subtitle: 'Manage bundles and promotional offers.' },
    '/admin/settings/widget/faq': { title: 'Widget FAQ Management', subtitle: 'Manage frequently asked questions for the booking widget.' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const currentConfig = ROUTE_CONFIG[pathname] || { title: 'Admin Panel', subtitle: 'Clinic Management System' };

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-[#F8F9FC] font-sans text-slate-600">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/5 transition-opacity lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Clean & Premium Light */}
            <Sidebar sidebarOpen={sidebarOpen} mobileMenuOpen={mobileMenuOpen} />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Minimal Top Header - This stays static during navigation */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                    {/* Left: Mobile Toggle & Title */}
                    <div className="flex items-center gap-4 w-full">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu size={24} />
                        </button>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <PanelLeft size={20} />
                        </button>

                        <Breadcrumbs />
                    </div>
                </header>

                <div className="px-4 sm:px-8 pt-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 transition-all duration-200">
                                {currentConfig.title}
                            </h1>
                            <p className="text-gray-500 mt-1 transition-all duration-200">
                                {currentConfig.subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content - Only this part swaps when navigating */}
                <main className="flex-1 p-4 sm:p-8 pt-0 sm:pt-0 overflow-y-auto min-h-0">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
