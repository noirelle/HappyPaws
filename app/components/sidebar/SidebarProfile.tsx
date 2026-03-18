import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/login/actions';
import ConfirmationModal from '../ui/ConfirmationModal';

interface SidebarProfileProps {
    sidebarOpen: boolean;
}

export default function SidebarProfile({ sidebarOpen }: SidebarProfileProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full p-4 border-t border-gray-50 bg-white animate-pulse">
                <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                    <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                    {sidebarOpen && (
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="h-3 bg-gray-100 rounded w-24" />
                            <div className="h-2 bg-gray-50 rounded w-16" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <div className="w-full p-4 border-t border-gray-50 bg-white">
                <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} transition-all duration-300`}>
                    <div className="relative w-9 h-9 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm shadow-blue-50">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto'}`}>
                        <span className="font-bold text-gray-700 text-xs whitespace-nowrap truncate max-w-[120px]">
                            {displayName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate max-w-[120px]">
                            {user?.email}
                        </span>
                    </div>
                    {sidebarOpen && (
                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg group"
                            title="Sign Out"
                        >
                            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                isLoading={isLoggingOut}
                title="Sign Out"
                message="Are you sure you want to sign out of the clinic management system?"
                confirmText="Sign Out"
                type="danger"
            />
        </>
    );
}
