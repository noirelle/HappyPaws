'use client';

import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarProfile from './SidebarProfile';

interface SidebarProps {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
}

export default function Sidebar({ sidebarOpen, mobileMenuOpen }: SidebarProps) {
    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-[bezier(0.25,0.1,0.25,1.0)] 
      ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full shadow-none'} 
      lg:translate-x-0 lg:block ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      bg-white border-r border-gray-100 flex flex-col z-40`}
        >
            <SidebarLogo sidebarOpen={sidebarOpen} />
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <SidebarNav sidebarOpen={sidebarOpen} />
            </div>

            <SidebarProfile sidebarOpen={sidebarOpen} />
        </aside>
    );
}
