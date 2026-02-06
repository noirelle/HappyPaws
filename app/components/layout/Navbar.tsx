'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isBookingPage = pathname === '/book';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled
        ? 'py-3 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100/50'
        : 'py-6 bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group no-underline">
          <div className="w-9 h-9 bg-gradient-to-tr from-primary to-blue-400 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            🐾
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-800">
            Happy<span className="text-primary">Paws</span>
          </span>
        </a>

        {/* Desktop Links - Hide on booking page to minimize distraction */}
        {!isBookingPage && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <ul className="flex items-center gap-6">
              {[

                { name: 'About', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Team', href: '#team' },
                { name: 'Reviews', href: '#reviews' }
              ].map((item) => {
                // If we are NOT on home page, prepend / to anchor links
                // Exception: Home always goes to /
                const isHome = pathname === '/';
                let href = item.href;

                if (!isHome && item.href.startsWith('#')) {
                  href = `/${item.href}`;
                }



                return (
                  <li key={item.name}>
                    <a
                      href={href}
                      onClick={(e) => {
                        // Smooth scroll handling for same-page anchors
                        if (href.startsWith('#')) {
                          e.preventDefault();
                          if (href === '#') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            const element = document.querySelector(href);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }
                      }}
                      className="text-base font-medium text-gray-600 hover:text-primary transition-colors duration-200 block no-underline relative group cursor-pointer"
                    >
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-4">

          {isBookingPage ? (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Booking in progress
            </div>
          ) : (
            <a
              href="/book"
              className="bg-gray-900 text-white py-2.5 px-6 rounded-lg text-sm font-bold shadow-lg hover:bg-primary hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 no-underline"
            >
              <span>Book Now</span>
              <span className="bg-white/20 rounded w-5 h-5 flex items-center justify-center text-[10px]"><ArrowRight size={12} /></span>
            </a>

          )}
        </div>
      </div>
    </nav>
  );
}
