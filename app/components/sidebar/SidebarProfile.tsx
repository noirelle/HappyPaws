'use client';

import NextImage from 'next/image';
import { LogOut } from 'lucide-react';


interface SidebarProfileProps {
    sidebarOpen: boolean;
}

export default function SidebarProfile({ sidebarOpen }: SidebarProfileProps) {
    return (
        <div className="w-full p-4 border-t border-gray-50 bg-white">
            <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} transition-all duration-300`}>
                <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    <NextImage
                        src="/team-1.png"
                        alt="Admin User"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className={`flex flex-col overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto'}`}>
                    <span className="font-bold text-gray-700 text-xs whitespace-nowrap">Dr. Sarah Smith</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Veterinarian</span>
                </div>
                {sidebarOpen && (
                    <button className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                )}

            </div>
        </div>
    );
}
