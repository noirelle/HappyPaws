'use client';

import { useEffect, useState } from 'react';

export default function StickyPromoBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 w-full bg-accent text-white text-center py-3 px-5 z-50 flex justify-center items-center shadow-lg transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="font-semibold text-base flex items-center gap-4">
        <span>🐾 FIRST VISIT? Get 20% OFF your first Wellness Exam!</span>
        <button className="bg-white text-accent border-none py-1.5 px-4 rounded-full font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-md text-sm">
          Claim Discount
        </button>
      </div>
    </div>
  );
}
