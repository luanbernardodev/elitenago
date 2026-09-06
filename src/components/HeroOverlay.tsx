import React from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';

gsap.registerPlugin(ScrollToPlugin);

export const HeroOverlay: React.FC = () => {
  const scrollToContent = () => {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: '#sobre', offsetY: 40 },
      ease: 'power3.inOut',
    });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full max-w-7xl mx-auto flex flex-col justify-between pt-24 sm:pt-28 pb-8 px-4 sm:px-8 md:px-16 z-10 pointer-events-none overflow-hidden"
    >
      {/* Background Editorial Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <h1 className="watermark-text text-[18vw] md:text-[22vw] tracking-tighter opacity-[0.04] text-amber-100 font-syne whitespace-nowrap">
          NAGÔ
        </h1>
      </div>

      {/* Hero Central Editorial Content - Optimized for all mobile dimensions */}
      <div className="my-auto max-w-3xl z-10 space-y-4 sm:space-y-6 pt-4 sm:pt-6 w-full">
        <h1 className="text-[2.6rem] xs:text-[2.6rem] sm:text-6xl md:text-8xl lg:text-8xl cinzel-decorative-bold tracking-normal leading-[1.1] break-words select-none">
          <span className="text-gold-gradient drop-shadow-[0_10px_25px_rgba(238,220,154,0.35)]">
            Elite
          </span>
          <br />
          <span className="text-white drop-shadow-2xl">
            Nagô
          </span>
        </h1>

        <p className="pointer-events-auto max-w-xl text-xs sm:text-base md:text-xl text-neutral-300 font-light leading-relaxed backdrop-blur-sm bg-black/50 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
          Força, agilidade, musicalidade e ancestralidade unidas no mais alto nível da Capoeira.
        </p>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
          <InteractiveHoverButton
            onClick={scrollToContent}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm"
          >
            Explorar História & Roda
          </InteractiveHoverButton>

          <InteractiveHoverButton
            onClick={() => {
              gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: '#midias', offsetY: 40 },
                ease: 'power3.inOut',
              });
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm"
          >
            Mídias
          </InteractiveHoverButton>
        </div>
      </div>
    </section>
  );
};

export default HeroOverlay;
