'use client';

import Link from 'next/link';

import { PawPrint } from 'lucide-react';

interface SidebarLogoProps {
    sidebarOpen: boolean;
}

export default function SidebarLogo({ sidebarOpen }: SidebarLogoProps) {
    return (
        <div className={`h-20 flex items-center ${sidebarOpen ? 'px-6' : 'justify-center'} border-b border-gray-50`}>
            <Link href="/" className="flex items-center gap-2 group no-underline">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary to-blue-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                    <PawPrint size={18} />
                </div>

                <span className={`text-lg font-extrabold tracking-tight text-gray-800 transition-all duration-300 ${!sidebarOpen && 'lg:w-0 lg:opacity-0 lg:overflow-hidden'}`}>
                    Happy<span className="text-primary">Paws</span>
                </span>
            </Link>
        </div>
    );
}
