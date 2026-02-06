import StickyPromoBar from './components/features/StickyPromoBar';
import ChatWidget from './components/features/ChatWidget';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/sections/HeroSection';
import PromoSection from './components/sections/PromoSection';
import AboutSection from './components/sections/AboutSection';
import ServicesSection from './components/sections/ServicesSection';
import TeamSection from './components/sections/TeamSection';
import BookingSection from './components/sections/BookingSection';
import SocialProofSection from './components/sections/SocialProofSection';
import Footer from './components/layout/Footer';

export default function Home() {
  return (
    <main>
      {/* <StickyPromoBar /> */}
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <PromoSection />
      <BookingSection />
      <SocialProofSection />
      <Footer />
      <ChatWidget />
    </main>
  );
}

