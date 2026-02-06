'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Sidebar from '../components/sidebar/Sidebar';
import { Menu, PanelLeft } from 'lucide-react';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-[#F8F9FC] font-sans text-slate-600">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Clean & Premium Light */}
            {/* Sidebar - Clean & Premium Light */}
            <Sidebar sidebarOpen={sidebarOpen} mobileMenuOpen={mobileMenuOpen} />

            {/* Main Content Area */}
            < div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`
            }>
                {/* Minimal Top Header */}
                < header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20" >
                    {/* Left: Mobile Toggle & Title */}
                    < div className="flex items-center gap-4 w-full" >
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
                    </div >


                </header >

                {/* Scrollable Content */}
                < main className="flex-1 p-4 sm:p-8 overflow-y-auto" >
                    {children}
                </main >
            </div >
        </div >
    );
}
