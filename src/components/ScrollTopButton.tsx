import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export const ScrollTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show when approaching footer (within 1600px of page bottom)
      if (scrollY + windowHeight >= documentHeight - 1600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1.4,
      scrollTo: { y: 0 },
      ease: 'power3.inOut',
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 transition-all duration-500 transform ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-8 pointer-events-none scale-90'
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Voltar ao topo da página"
        className="group relative overflow-hidden flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#0a0a0e]/85 backdrop-blur-xl text-neutral-200 hover:text-white border border-white/15 hover:border-white/35 hover:bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(255,255,255,0.04)] text-xs font-mono font-medium tracking-wide transition-all duration-300 active:scale-95 cursor-pointer hover:scale-105"
      >
        <span>Voltar ao topo</span>
        <ArrowUp className="w-3.5 h-3.5 text-neutral-200 group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-300" />
      </button>
    </div>
  );
};

export default ScrollTopButton;
