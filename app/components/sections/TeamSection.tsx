'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Linkedin, Twitter } from 'lucide-react';


interface TeamMember {
    name: string;
    role: string;
    image: string;
    bio: string;
    specialty: string;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: "Dr. Emily Chen",
        role: "Chief Veterinarian",
        image: "/team-1.png",
        bio: "With over 15 years of experience, Dr. Chen specializes in internal medicine and geriatric pet care.",
        specialty: "Internal Medicine"
    },
    {
        name: "Dr. Mark Davis",
        role: "Lead Surgeon",
        image: "/team-2.png",
        bio: "Board-certified surgeon known for his expertise in orthopedic and soft tissue procedures.",
        specialty: "Orthopedic Surgery"
    },
    {
        name: "Sarah Wilson",
        role: "Senior Vet Tech",
        image: "/team-3.png",
        bio: "Dedicated to making every pet's visit as stress-free and comfortable as possible.",
        specialty: "Patient Care"
    },
    {
        name: "Dr. James Wilson",
        role: "Dental Specialist",
        image: "/team-4.png",
        bio: "Passionate about oral health and preventative dental care for pets of all sizes.",
        specialty: "Veterinary Dentistry"
    },
    {
        name: "Lisa Ray",
        role: "Practice Manager",
        image: "/team-5.png",
        bio: "Ensures our clinic runs smoothly and that every client receives exceptional service.",
        specialty: "Client Relations"
    }
];

export default function TeamSection() {
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
        <section className="py-24 px-[5%] bg-white overflow-hidden relative" id="team">

            {/* Decorative Background Blobs - MATCHING ABOUT SECTION */}
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-50/50 rounded-full blur-3xl -z-10 -translate-x-1/3"></div>

            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-16 relative">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Our Experts</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Dream Team</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Our team of dedicated professionals is here to provide the compassionate care your pet deserves.
                    </p>
                </div>

                {/* Swipeable Carousel Viewport with Mouse Drag Support */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-12 -mx-5 px-5 md:mx-0 md:px-0 flex gap-6 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {TEAM_MEMBERS.map((member, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[300px] md:w-[350px] snap-center"
                        >
                            <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group h-full flex flex-col transform hover:-translate-y-1">

                                {/* Image Area with Gradient Overlay matching Hero/About feel */}
                                <div className="relative h-72 overflow-hidden bg-gray-100">
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-300 select-none bg-gradient-to-tr from-gray-50 to-gray-200">
                                        {/* Fallback avatar */}
                                        👨‍⚕️
                                    </div>

                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.opacity = '0';
                                        }}
                                        draggable={false}
                                    />

                                    {/* Social Overlay */}
                                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                        <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <button className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-blue-50 transition-colors">
                                                <span className="sr-only">LinkedIn</span>
                                                <Linkedin size={20} />
                                            </button>
                                            <button className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-blue-50 transition-colors">
                                                <span className="sr-only">Twitter</span>
                                                <Twitter size={20} />
                                            </button>

                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex-grow flex flex-col items-center text-center relative">
                                    {/* Floating Specialty Badge */}
                                    <div className="absolute -top-6 bg-white py-2 px-4 rounded-full shadow-md text-sm font-bold text-primary border border-gray-100/50">
                                        {member.specialty}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{member.name}</h3>
                                    <p className="text-sm font-semibold text-blue-500 mb-6 uppercase tracking-wide">{member.role}</p>

                                    <p className="text-gray-600 leading-relaxed mb-6 flex-grow italic">
                                        "{member.bio}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
