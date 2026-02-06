'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function HeroSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset after 3 seconds
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-[5%] pt-32 pb-20 lg:pt-[100px] lg:pb-[50px] bg-white overflow-hidden text-center lg:text-left">

      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4"></div>

      <div className="flex-1 max-w-[650px] z-10 lg:pr-12 mb-12 lg:mb-0 flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary font-bold text-sm mb-6 border border-blue-100 shadow-sm">
          <span className="animate-pulse">●</span> Available Today
        </div>

        <h1 className="text-5xl lg:text-7xl leading-[1.1] text-gray-900 mb-6 font-extrabold tracking-tight">
          Modern Care for <br className="hidden lg:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Your Best Friend.</span>
        </h1>

        <p className="text-lg lg:text-xl text-gray-500 mb-10 max-w-[520px] leading-relaxed">
          Experience veterinary care reimagined. We combine advanced medicine with a gentle touch to keep your pet happy and healthy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
          <a href="/book" className="bg-primary text-white py-4 px-8 rounded-full text-lg font-bold shadow-[0_10px_25px_rgba(0,174,239,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,174,239,0.4)] no-underline flex items-center justify-center gap-2">
            Book an Appointment <span>→</span>
          </a>
          <a href="#services" className="px-8 py-4 rounded-full text-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors no-underline">
            View Services
          </a>
        </div>

        <div className="mt-12 flex items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden`}>
                <Image src={`/team-${i}.png`} alt="User" width={40} height={40} className="w-full h-full object-cover"
                  // Fallback for demo since we might not have team images
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.background = '#ddd' }}
                />
              </div>
            ))}
          </div>
          <div>
            <span className="text-gray-900 font-bold">2,000+</span> Happy Clients
          </div>
        </div>
      </div>

      <div className="flex-1 relative w-full lg:w-1/2 flex justify-center perspective-1000">

        {/* Animated Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/40 to-green-100/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="relative z-10 w-full max-w-[500px] lg:max-w-[550px]">

          {/* Floating Badge 1 */}
          <div className="absolute top-12 -left-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg z-30 animate-[float_4s_ease-in-out_infinite] border border-white/50 hidden md:flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-xl">❤️</div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Satisfaction</div>
              <div className="font-bold text-gray-800">100% Guaranteed</div>
            </div>
          </div>

          {/* Floating Badge 2 */}
          <div className="absolute bottom-24 -right-8 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg z-30 animate-[float_5s_ease-in-out_infinite_1s] border border-white/50 hidden md:flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-xl">🛡️</div>
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Certified</div>
              <div className="font-bold text-gray-800">Veterinary Professionals</div>
            </div>
          </div>

          {/* Organic Image Container */}
          <div className="relative rounded-[3rem] rounded-tl-[6rem] rounded-br-[6rem] overflow-hidden shadow-2xl border-4 border-white transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500 group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
            {/* Fallback pattern if image fails or missing */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center -z-10">
              <span className="text-6xl opacity-20">🐶</span>
            </div>

            <Image
              src="/hero.png"
              alt="Happy Golden Retriever with Vet"
              width={700}
              height={700}
              className="w-full h-auto object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              priority
            />
          </div>

          {/* Decorative dots grid */}
          <div className="absolute -bottom-10 -left-10 w-24 h-24 text-blue-200/50 -z-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="currentColor">
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" />
              </pattern>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
