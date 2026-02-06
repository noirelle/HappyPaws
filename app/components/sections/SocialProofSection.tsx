import Image from 'next/image';
import { Star, Trophy, Building2, Heart } from 'lucide-react';


export default function SocialProofSection() {
  const reviews = [
    { name: "Sarah & Max", text: "Happy Paws saved Max's leg after his accident. Forever grateful!", pet: "/puppy_kit.png" },
    { name: "John & Bella", text: "The cleanest, friendliest clinic in town. Bella actually likes going here.", pet: "/senior_pet.png" },
    { name: "Emily & Fluffy", text: "Dr. Smith is a miracle worker with rabbits. Highly recommended.", pet: "/dental_care.png" },
    { name: "Mike & Rocky", text: "Great prices on the wellness plan. It pays for itself.", pet: "/hero.png" },
    // Repeat for infinite scroll illusion
    { name: "Sarah & Max", text: "Happy Paws saved Max's leg after his accident. Forever grateful!", pet: "/puppy_kit.png" },
    { name: "John & Bella", text: "The cleanest, friendliest clinic in town. Bella actually likes going here.", pet: "/senior_pet.png" },
  ];

  return (
    <section className="py-24 px-[5%] bg-white overflow-hidden" id="reviews">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Trusted by 2,000+ Happy Owners</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          We don't just treat pets; we treat them like family. See what our community has to say.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          {
            quote: "They saved my dog's life during an emergency. I can't thank Dr. Smith enough for her quick thinking and compassion.",
            author: "Sarah J.",
            pet: "Max (Golden Retriever)",
            rating: 5,
            image: "/team-1.jpg" // Assuming these exist, or fallback
          },
          {
            quote: "The best vet clinic in town! The staff is always so friendly and the facility is spotless. My cat actually likes going here.",
            author: "Michael T.",
            pet: "Luna (Siamese)",
            rating: 5,
            image: "/team-2.jpg"
          },
          {
            quote: "Affordable wellness plans and easy online booking. Makes taking care of my three rabbits so much easier.",
            author: "Emily R.",
            pet: "Buns, Thumper & Oreos",
            rating: 5,
            image: "/team-3.jpg"
          }
        ].map((review, i) => (
          <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="flex gap-1 mb-4 text-yellow-400 text-lg">
              {Array.from({ length: review.rating }).map((_, idx) => (
                <Star key={idx} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-gray-600 italic mb-6 text-lg leading-relaxed">"{review.quote}"</p>
            <div className="mt-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                {/* Placeholder for team if image fails */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-xl select-none">
                  {review.author[0]}
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900">{review.author}</div>
                <div className="text-sm text-primary font-medium">{review.pet}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats / Logos Row */}
      <div className="border-t border-gray-100 pt-16">
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder logos */}
          <div className="text-2xl font-bold flex items-center gap-2"><span><Trophy size={24} /></span> Voted #1 Vet 2025</div>
          <div className="text-2xl font-bold flex items-center gap-2"><span><Building2 size={24} /></span> AAHA Accredited</div>
          <div className="text-2xl font-bold flex items-center gap-2"><span><Heart size={24} /></span> Fear Free Certified</div>
          <div className="text-2xl font-bold flex items-center gap-2"><span><Star size={24} fill="currentColor" /></span> 5-Star Rated</div>

        </div>
      </div>
    </section>
  );
}
