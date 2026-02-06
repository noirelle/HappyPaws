'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ChevronRight, Search, X } from 'lucide-react';


// Modular Route Definitions
const SEARCHABLE_ROUTES = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        description: 'Overview of your clinic performance and daily stats.',
        keywords: ['home', 'main', 'stats']
    },
    {
        title: 'Appointments',
        href: '/admin/appointments',
        description: 'Manage bookings, reschedule visits, and view calendar.',
        keywords: ['calendar', 'bookings', 'schedule']
    },
    {
        title: 'Vets',
        href: '/admin/vets',
        description: 'Manage veterinary staff profiles and availability.',
        keywords: ['staff', 'doctors', 'employees']
    },
    {
        title: 'Clients',
        href: '/admin/clients',
        description: 'Database of pet owners and their contact details.',
        keywords: ['users', 'customers', 'owners']
    },
    {
        title: 'Settings',
        href: '/admin/schedule',
        description: 'Configure clinic hours, services, and system preferences.',
        keywords: ['config', 'setup', 'admin']
    },
];

export default function Breadcrumbs() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Derived paths
    const paths = pathname.split('/').filter(path => path && path !== 'admin');

    // Path label mapping
    const pathNames: Record<string, string> = {
        admin: 'Admin',
        dashboard: 'Dashboard',
        appointments: 'Appointments',
        vets: 'Vets',
        clients: 'Clients',
        schedule: 'Settings',
    };

    // Filter routes based on search
    const filteredRoutes = SEARCHABLE_ROUTES.filter(route => {
        const query = searchQuery.toLowerCase();
        return (
            route.title.toLowerCase().includes(query) ||
            route.description.toLowerCase().includes(query) ||
            route.keywords.some(k => k.includes(query))
        );
    });

    // Keyboard navigation for search
    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSearchOpen) {
                // Command/Ctrl + K to open
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    setIsSearchOpen(true);
                }
                return;
            }

            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredRoutes.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredRoutes[selectedIndex]) {
                    handleSelect(filteredRoutes[selectedIndex].href);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen, filteredRoutes, selectedIndex]);

    const handleSelect = (href: string) => {
        router.push(href);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="flex items-center justify-between w-full gap-4">
            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb" className="flex items-center min-w-0 overflow-hidden">
                <ol className="flex items-center space-x-2 whitespace-nowrap">
                    {/* Home Icon */}
                    <li className="flex items-center shrink-0">
                        <Link href="/admin/dashboard" className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100">
                            <Home size={20} />
                        </Link>
                    </li>


                    {/* Desktop: Show full path */}
                    {paths.map((path, index) => {
                        const href = `/admin/${paths.slice(0, index + 1).join('/')}`;
                        const isLast = index === paths.length - 1;
                        const name = pathNames[path] || path.charAt(0).toUpperCase() + path.slice(1);

                        return (
                            <li key={path} className={`flex items-center ${!isLast ? 'hidden sm:flex' : ''}`}>
                                <ChevronRight className={`w-4 h-4 text-gray-300 mx-2 ${!isLast ? 'hidden sm:block' : ''}`} />


                                {isLast ? (
                                    <>
                                        {/* Separator for mobile if it's the last item but there are previous items hidden */}
                                        <ChevronRight className="w-4 h-4 text-gray-300 mx-2 sm:hidden shrink-0" />

                                        <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px] sm:max-w-none">
                                            {name}
                                        </span>
                                    </>
                                ) : (
                                    <Link
                                        href={href}
                                        className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                                    >
                                        {name}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {/* Search Trigger */}
            <div className="relative shrink-0">
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-800 hover:bg-white bg-gray-50/50 border border-transparent hover:border-gray-200 rounded-lg transition-all duration-200 text-sm group"
                    title="Search (Cmd+K)"
                >
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />

                    <span className="hidden md:inline text-xs text-gray-400 group-hover:text-gray-500 font-medium">Search...</span>
                    <span className="hidden md:inline-flex items-center justify-center text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 min-w-[24px]">⌘K</span>
                </button>
            </div>

            {/* Search Modal Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
                    {/* Transparent Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0"
                        onClick={() => setIsSearchOpen(false)}
                    />

                    {/* Modal Content */}
                    <div
                        className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-[fadeIn_0.15s_ease-out]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center border-b border-gray-100 px-4 py-3 gap-3">
                            <Search className="w-5 h-5 text-gray-400" />

                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search pages..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base h-8"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 text-xs bg-gray-50 rounded"
                            >ESC</button>
                        </div>

                        {/* Results */}
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredRoutes.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 text-sm">
                                    No results found for "{searchQuery}"
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredRoutes.map((route, idx) => (
                                        <button
                                            key={route.href}
                                            onClick={() => handleSelect(route.href)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex flex-col gap-0.5 transition-colors
                                                ${idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                            `}
                                        >
                                            <span className={`text-sm font-semibold ${idx === selectedIndex ? 'text-primary' : 'text-gray-800'}`}>
                                                {route.title}
                                            </span>
                                            <span className="text-xs text-gray-400 line-clamp-1">
                                                {route.description}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                            <span>Navigate with arrows</span>
                            <span>Enter to select</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
