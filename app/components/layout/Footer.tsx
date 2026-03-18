'use client';

import { useState } from 'react';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';


export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 px-[5%] pb-10 mt-24 relative overflow-hidden">
      {/* Decorative Wave */}
      <div className="absolute top-[-50px] left-0 w-full h-[100px] bg-white rounded-b-[50%] scale-x-150 z-10"></div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-20">
        {/* Brand Column */}
        <div>
          <h3 className="text-primary mb-6 text-xl uppercase tracking-wider font-bold">J.A.A. Clinic 🐾</h3>
          <p className="text-gray-400 leading-relaxed mb-5 text-sm">
            Dedicated to providing the highest standard of veterinary care with a gentle touch. Your pet is family here.
          </p>
          <div className="flex gap-4">
            {[<Facebook size={20} />, <Twitter size={20} />, <Instagram size={20} />].map((icon, i) => (
              <div key={i} className="w-9 h-9 bg-[#333] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-primary hover:-translate-y-1">
                {icon}
              </div>
            ))}

          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-primary mb-6 text-xl uppercase tracking-wider font-bold">Quick Links</h3>
          <ul className="space-y-3">
            {['About Us', 'Our Services', 'Meet the Team', 'Book Appointment', 'Careers'].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-300 transition-colors duration-300 hover:text-primary inline-block hover:translate-x-1">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-primary mb-6 text-xl uppercase tracking-wider font-bold">Contact Us</h3>
          <div className="space-y-3 text-gray-300">
            <p className="flex items-center gap-3"><span className="text-accent"><MapPin size={18} /></span> 123 Paws Avenue, Pet City, FL 33101</p>
            <p className="flex items-center gap-3"><span className="text-accent"><Phone size={18} /></span> (555) 123-4567</p>
            <p className="flex items-center gap-3"><span className="text-accent"><Mail size={18} /></span> hello@jaavetclinic.com</p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1"><Clock size={18} /></span>
              <span>Mon-Sat: 8am - 8pm<br />Sun: 10am - 4pm</span>
            </p>
          </div>

        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-primary mb-6 text-xl uppercase tracking-wider font-bold">Stay Updated</h3>
          <p className="text-gray-400 leading-relaxed mb-5 text-sm">Get pet care tips and exclusive offers.</p>
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-[#444] bg-[#333] text-white mb-3 outline-none focus:border-primary transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full p-3 rounded-lg bg-primary text-white border-none font-semibold cursor-pointer transition-colors hover:bg-[#009ad4]">
              {subscribed ? 'Subscribed! 🎉' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-20 pt-5 border-t border-[#333] text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 J.A.A. Clinic. All Rights Reserved.</p>
          <div className="flex gap-5 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
