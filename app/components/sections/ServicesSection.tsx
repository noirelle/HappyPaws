'use client';

import { useState, useRef, useEffect } from 'react';

import { Stethoscope, Syringe, Scissors, Activity, Microscope, Ambulance } from 'lucide-react';


interface Service {
    icon: React.ElementType;

    title: string;
    description: string;
    color: string;
    bookingReason: string;
}
export default function ServicesSection() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getIconComponent = (name: string) => {
        switch (name) {
            case 'Syringe': return Syringe;
            case 'Scissors': return Scissors;
            case 'Activity': return Activity;
            case 'Microscope': return Microscope;
            case 'Ambulance': return Ambulance;
            default: return Stethoscope;
        }
    };

    const getColorForIcon = (name: string) => {
        switch (name) {
            case 'Syringe': return "bg-green-50 text-green-600";
            case 'Scissors': return "bg-purple-50 text-purple-600";
            case 'Activity': return "bg-yellow-50 text-yellow-600";
            case 'Microscope': return "bg-red-50 text-red-600";
            case 'Ambulance': return "bg-indigo-50 text-indigo-600";
            default: return "bg-blue-50 text-blue-600";
        }
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    const data = await res.json();
                    // Show only active services on home page
                    setServices(data.filter((s: any) => s.is_active));
                }
            } catch (err) {
                console.error('Failed to load services', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
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
        <section className="py-24 px-[5%] bg-gray-50 overflow-hidden" id="services">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Our Expertise</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">World-Class Veterinary Services</h2>
                    <p className="text-xl text-gray-600">
                        From routine checkups to advanced surgeries, we provide the highest standard of care for your furry family members.
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
                            <div key={i} className="flex-shrink-0 w-[350px] md:w-[400px] bg-white rounded-[2rem] p-10 shadow-lg border border-gray-100 animate-pulse">
                                <div className="w-20 h-20 bg-gray-100 rounded-2xl mb-8" />
                                <div className="h-8 bg-gray-100 rounded w-2/3 mb-6" />
                                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-100 rounded w-full mb-8" />
                                <div className="h-14 bg-gray-100 rounded-xl" />
                            </div>
                        ))
                    ) : services.map((service, index) => {
                        const Icon = getIconComponent(service.icon_name);
                        const colorClass = getColorForIcon(service.icon_name);
                        
                        return (
                            <div
                                key={service.id || index}
                                className="flex-shrink-0 w-[350px] md:w-[400px] snap-center h-auto"
                            >
                                <div
                                    className="bg-white rounded-[2rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col h-full transform hover:-translate-y-2"
                                >
                                    <div className={`w-20 h-20 rounded-2xl ${colorClass} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <Icon size={40} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-6">{service.name}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg mb-8 flex-grow">{service.description}</p>

                                    <div className="mt-auto">
                                        <a
                                            href={`/book?reason=${encodeURIComponent(service.name)}`}
                                            className="inline-flex items-center justify-center w-full bg-gray-50 text-gray-900 font-bold py-4 rounded-xl border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group-hover:shadow-md"
                                            draggable={false}
                                        >
                                            Book Service <span className="ml-2 text-lg">→</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
