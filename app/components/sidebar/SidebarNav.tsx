'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Stethoscope, Users, CalendarClock, MessageSquare, ChevronDown, ChevronRight, MessageCircleQuestion } from 'lucide-react';
import { useState, useEffect } from 'react';


interface SidebarNavProps {
    sidebarOpen: boolean;
}

interface NavItem {
    name: string;
    href?: string;
    icon?: React.ReactNode;
    items?: NavItem[];
}

export default function SidebarNav({ sidebarOpen }: SidebarNavProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const navGroups = [
        {
            title: 'Overview',
            items: [
                {
                    name: 'Dashboard', href: '/admin/dashboard', icon: (
                        <LayoutDashboard size={20} />
                    )
                }
            ]
        },
        {
            title: 'Practice',
            items: [
                {
                    name: 'Appointments', href: '/admin/appointments', icon: (
                        <Calendar size={20} />
                    )
                },
                {
                    name: 'Vets', href: '/admin/vets', icon: (
                        <Stethoscope size={20} />
                    )
                },
                {
                    name: 'Clients', href: '/admin/clients', icon: (
                        <Users size={20} />
                    )
                }
            ]
        },
        {
            title: 'Settings',
            items: [
                {
                    name: 'Schedule', href: '/admin/schedule', icon: (
                        <CalendarClock size={20} />
                    )

                },
                {
                    name: 'Widget',
                    icon: (
                        <MessageSquare size={20} />
                    ),
                    items: [
                        {
                            name: 'FAQs',
                            href: '/admin/settings/widget/faq',
                            icon: <MessageCircleQuestion size={18} />
                        }
                    ]
                }
            ]
        },
        {
            title: 'Management',
            items: [
                {
                    name: 'Users',
                    href: '/admin/users',
                    icon: (
                        <Users size={20} />
                    )
                },
                {
                    name: 'Roles',
                    href: '/admin/roles',
                    icon: (
                        <Users size={20} /> // Using Users icon as placeholder or find a Key/Shield icon
                    )
                }
            ]
        }
    ];

    useEffect(() => {
        const newExpanded: string[] = [];
        navGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.items && item.items.some(subItem => subItem.href === pathname)) {
                    newExpanded.push(item.name);
                }
            });
        });
        if (newExpanded.length > 0) {
            setExpandedItems(prev => {
                const combined = new Set([...prev, ...newExpanded]);
                return Array.from(combined);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const toggleExpand = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    return (
        <nav className="flex flex-col p-4 mt-2">
            {navGroups.map((group, groupIndex) => (
                <div key={group.title} className={`${groupIndex > 0 ? 'mt-6' : ''}`}>
                    {sidebarOpen && (
                        <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 px-4 transition-opacity duration-300">
                            {group.title}
                        </h3>
                    )}
                    <div className="flex flex-col gap-1">
                        {group.items.map((item) => {
                            const hasChildren = item.items && item.items.length > 0;
                            const isExpanded = expandedItems.includes(item.name);
                            const isActive = item.href === pathname;

                            // Parent Item Rendering
                            if (hasChildren) {
                                // Check if any child is active to highlight parent vaguely? 
                                // Usually we don't highlight parent as "active" in the same way, but maybe text color?
                                const isChildActive = item.items?.some(sub => sub.href === pathname);

                                return (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <button
                                            onClick={() => toggleExpand(item.name)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden w-full text-left font-normal
                                                ${isChildActive ? 'text-gray-700 bg-gray-50/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                                            `}
                                            title={!sidebarOpen ? item.name : ''}
                                        >
                                            <span className={`shrink-0 transition-colors duration-300 ${isChildActive ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                {item.icon}
                                            </span>

                                            <span className={`flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'}`}>
                                                {item.name}
                                            </span>

                                            {sidebarOpen && (
                                                <span className="shrink-0 text-gray-400">
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </span>
                                            )}
                                        </button>

                                        {/* Subitems */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {item.items?.map((subItem) => {
                                                    const isSubActive = pathname === subItem.href;
                                                    return (
                                                        <Link
                                                            key={subItem.href}
                                                            href={subItem.href || '#'}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group no-underline relative overflow-hidden ml-4 font-normal
                                                                ${isSubActive
                                                                    ? 'text-primary bg-blue-50'
                                                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                                                }
                                                            `}
                                                            title={!sidebarOpen ? subItem.name : ''}
                                                        >
                                                            {isSubActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>}
                                                            <span className={`shrink-0 transition-colors duration-300 ${isSubActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                                {subItem.icon}
                                                            </span>
                                                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 text-sm ${!sidebarOpen ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'}`}>
                                                                {subItem.name}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Regular Item Rendering
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href!}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group no-underline relative overflow-hidden
                                        ${isActive
                                            ? 'text-primary font-semibold bg-blue-50'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                        }
                                    `}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>}
                                    <span className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 '}`}>{item.icon}</span>
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
