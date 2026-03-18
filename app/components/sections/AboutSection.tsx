'use client';

import Image from 'next/image';

export default function AboutSection() {
    return (
        <section className="py-24 px-[5%] bg-white overflow-hidden" id="about">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

                    {/* Image Side */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            {/* Placeholder color block if image missing */}
                            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                            {/* <Image 
                src="/about-team.jpg" 
                alt="Our Veterinary Team" 
                fill 
                className="object-cover"
              /> */}
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 text-blue-200">
                                <span className="text-9xl">🏥</span>
                            </div>
                        </div>

                        {/* Decorative Element */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full -z-10 blur-3xl"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full -z-10 blur-3xl"></div>
                    </div>

                    {/* Text Side */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Our Story</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            More Than Just a <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Veterinary Clinic</span>
                        </h2>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Founded in 2010, J.A.A. Clinic began with a simple mission: to provide the same level of medical care for pets that we expect for ourselves.
                        </p>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            We believe in low-stress handling, transparent pricing, and treating every animal that walks through our doors as if they were our own. Our team of certified specialists is here to support you through every stage of your pet's life.
                        </p>

                        <div className="flex flex-wrap gap-8 mb-10 border-t border-gray-100 pt-8 justify-center lg:justify-start">
                            <div>
                                <span className="block text-4xl font-bold text-gray-900 mb-1">15+</span>
                                <span className="text-sm text-gray-500 font-medium">Years Experience</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-bold text-gray-900 mb-1">50k+</span>
                                <span className="text-sm text-gray-500 font-medium">Happy Pets</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-bold text-gray-900 mb-1">24/7</span>
                                <span className="text-sm text-gray-500 font-medium">Emergency Care</span>
                            </div>
                        </div>

                        <a href="#team" className="inline-block bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900 py-3 px-8 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md">
                            Meet Our Team
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
}
