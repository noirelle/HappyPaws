'use client';

import { usePathname } from 'next/navigation';
import { useWidget } from '@/app/providers/WidgetProvider';

export default function GlobalLoader() {
    const pathname = usePathname();
    // Don't show loader on admin pages
    const isAdmin = pathname?.startsWith('/admin');
    const { loading } = useWidget();

    if (!loading || isAdmin) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500">
            <div className="relative w-24 h-24">
                {/* Pulsing specific paw pad */}
                <div className="absolute inset-0 text-6xl text-primary animate-bounce flex items-center justify-center">
                    🐾
                </div>
                {/* Ripple effect */}
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold text-gray-800 tracking-wider">
                    Happy<span className="text-primary">Paws</span>
                </h3>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                </div>
            </div>
        </div>
    );
}
