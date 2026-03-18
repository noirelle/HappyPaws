'use client';

import { useState, useRef, useEffect } from 'react';

export default function PromoSection() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/packages?active=true');
        if (res.ok) {
          const data = await res.json();
          setPromos(data);
        }
      } catch (err) {
        console.error('Failed to load promos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section className="py-24 px-[5%] bg-surface relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-wider text-sm mb-2 block">Special offers</span>
          <h2 className="text-center text-4xl md:text-5xl text-gray-800 font-bold">Total Care Packages</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            Bundle and save on our most popular preventative care services.
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-12 -mx-5 px-5 md:mx-0 md:px-0 flex gap-6 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-[320px] md:w-[380px] bg-white rounded-[2rem] p-10 text-center shadow-lg border border-gray-100 animate-pulse">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-8" />
                <div className="h-8 bg-gray-100 rounded w-2/3 mx-auto mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-8" />
                <div className="h-12 bg-gray-100 rounded-full w-40 mx-auto" />
              </div>
            ))
          ) : promos.map((promo, index) => (
            <div
              key={promo.id || index}
              className="flex-shrink-0 w-[320px] md:w-[380px] snap-center"
            >
              <div className="bg-white rounded-[2rem] p-10 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-gray-100 group relative overflow-hidden h-full flex flex-col items-center">

                {/* Decorative Blob */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${promo.color || 'bg-blue-50 text-blue-600'} opacity-10 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-150 duration-700`}></div>

                <div className={`w-24 h-24 ${promo.color || 'bg-blue-50 text-blue-600'} rounded-2xl mx-auto mb-8 flex items-center justify-center text-5xl shadow-sm group-hover:rotate-12 transition-transform duration-300`}>
                  {promo.icon}
                </div>

                <h3 className="text-2xl mb-4 text-gray-900 font-bold">{promo.title}</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed flex-grow">{promo.description}</p>

                <div className="mt-auto">
                  <span className={`inline-block ${promo.discount_color || 'bg-primary'} text-white py-3 px-8 rounded-full font-bold text-base shadow-lg hover:scale-105 transition-transform cursor-default`}>
                    {promo.discount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
