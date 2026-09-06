import React from 'react';
import { LogoLoop, LogoItem } from './LogoLoop';
import { ScrollFloat } from './ScrollFloat';

const PARTNER_LOGOS: LogoItem[] = [
  {
    src: '/logos/ascomcer.png',
    alt: 'Ascomcer',
    title: 'Ascomcer',
    href: 'https://www.ascomcer.org.br/',
  },
  {
    src: '/logos/mrs.png',
    alt: 'MRS Logística',
    title: 'MRS Logística',
    href: 'https://www.mrs.com.br/',
  },
  {
    src: '/logos/jk.png',
    alt: 'Supermercado JK',
    title: 'Supermercado JK',
    className: 'bg-white/95 rounded-xl p-1.5 shadow-sm',
    href: '#',
  },
  {
    src: '/logos/grupo_bahamas.png',
    alt: 'Grupo Bahamas',
    title: 'Grupo Bahamas',
    className: 'bg-white/95 rounded-xl p-1.5 shadow-sm',
    href: 'https://www.bahamas.com.br/',
  },
];

export const PartnersSection: React.FC = () => {
  return (
    <section
      id="apoiadores"
      className="relative scroll-mt-28 md:scroll-mt-36 py-24 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
    >
      {/* Centered Title with ScrollFloat */}
      <div className="flex justify-center items-center text-center w-full mb-14 sm:mb-20">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Apoiadores
        </ScrollFloat>
      </div>

      {/* Seamless Logo Loop with generous spacing and fluid speed */}
      <div className="w-full">
        <LogoLoop
          logos={PARTNER_LOGOS}
          speed={18}
          direction="left"
          logoHeight={58}
          gap={72}
          pauseOnHover={true}
          scaleOnHover={true}
          fadeOut={true}
          fadeOutColor="#000000"
          ariaLabel="Apoiadores do Grupo Elite Nagô"
        />
      </div>
    </section>
  );
};

export default PartnersSection;
