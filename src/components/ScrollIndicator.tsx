import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const SECTIONS = [
  { id: '#hero', label: 'Hero' },
  { id: '#sobre', label: 'Sobre' },
  { id: '#noticias', label: 'Notícias' },
  { id: '#midias', label: 'Mídias' },
  { id: '#ritmos', label: 'Ritmos' },
  { id: '#academias', label: 'Academias' },
  { id: '#contato', label: 'Contato' },
];

export const ScrollIndicator: React.FC = () => {
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('#hero');

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          setScrollPercentage(Math.min(100, Math.floor((scrollY / maxScroll) * 100)));
        }

        // Detect active section
        const halfWindow = window.innerHeight / 2;
        for (const sec of SECTIONS) {
          const el = document.querySelector(sec.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= halfWindow && rect.bottom >= 0) {
              setActiveSection(sec.id);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    gsap.to(window, {
      duration: 1.4,
      scrollTo: { y: id, offsetY: 30 },
      ease: 'power3.inOut',
    });
  };

  return (
    <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center gap-4 pointer-events-auto">
      {/* Scroll Progress Bar Vertical */}
      <div className="w-1 h-32 bg-neutral-900 rounded-full border border-amber-500/20 overflow-hidden relative">
        <div
          className="w-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full transition-all duration-150"
          style={{ height: `${scrollPercentage}%` }}
        />
      </div>

      {/* Side Dots */}
      <div className="flex flex-col gap-3 my-2">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            title={sec.label}
            className={`group relative flex items-center justify-center p-1 focus:outline-none`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSection === sec.id
                  ? 'bg-amber-400 scale-125 shadow-[0_0_10px_#f59e0b]'
                  : 'bg-amber-500/30 group-hover:bg-amber-400 group-hover:scale-110'
                }`}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-amber-300 uppercase tracking-widest bg-black/80 px-2 py-1 rounded border border-amber-500/30 whitespace-nowrap pointer-events-none">
              {sec.label}
            </span>
          </button>
        ))}
      </div>

      {/* Percentage Counter */}
      <span className="text-[10px] font-mono text-amber-400 font-bold">
        {scrollPercentage}%
      </span>
    </aside>
  );
};
