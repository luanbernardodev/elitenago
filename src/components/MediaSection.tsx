import React from 'react';
import { ScrollFloat } from './ScrollFloat';
import { CircularGallery } from './ui/CircularGallery';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';

interface MediaSectionProps {
  onOpenMediaPage?: () => void;
}

const CIRCULAR_GALLERY_ITEMS = [
  {
    image: 'https://i.imgur.com/A46hzMt.jpeg',
    text: ''
  },
  {
    image: '/img/cm_soldado.jpg',
    text: ''
  },
  {
    image: 'https://i.imgur.com/RWa2XaP.jpeg',
    text: ''
  },
  {
    image: '/img/mestre_pinheiro.jpg',
    text: ''
  },
  {
    image: 'https://i.imgur.com/TOTCg4x.jpeg',
    text: ''
  },
  {
    image: '/img/professor_dom_ruan.jpeg',
    text: ''
  },
  {
    image: 'https://i.imgur.com/IiYz7yh.jpeg',
    text: ''
  },
  {
    image: '/img/phPJ0Qh.jpeg',
    text: ''
  },
  {
    image: 'https://i.imgur.com/N3HsBOJ.jpeg',
    text: ''
  },
  {
    image: 'https://i.imgur.com/JtVhftz.jpeg',
    text: ''
  }
];

export const MediaSection: React.FC<MediaSectionProps> = ({ onOpenMediaPage }) => {
  const handleOpenAllMedia = () => {
    if (onOpenMediaPage) {
      onOpenMediaPage();
    } else {
      window.open('?view=midias', '_blank');
    }
  };

  return (
    <section
      id="midias"
      className="relative py-14 sm:py-20 w-full overflow-hidden z-10"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-center items-center text-center max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Mídias
        </ScrollFloat>
      </div>

      {/* Circular Gallery Container with Edge Fades */}
      <div className="w-full h-[380px] sm:h-[460px] lg:h-[520px] relative overflow-hidden bg-transparent select-none touch-pan-y">
        {/* Left Side Smooth Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 lg:w-48 z-10 pointer-events-none bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />

        {/* Right Side Smooth Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 lg:w-48 z-10 pointer-events-none bg-gradient-to-l from-[#050505] via-[#050505]/70 to-transparent" />

        <CircularGallery
          items={CIRCULAR_GALLERY_ITEMS}
          bend={1.4}
          textColor="#EEDC9A"
          borderRadius={0.06}
          scrollSpeed={2}
          scrollEase={0.06}
          onItemClick={handleOpenAllMedia}
        />
      </div>

      {/* Button to open full DomeGallery 3D in new tab / full page */}
      <div className="mt-8 sm:mt-10 flex justify-center items-center px-4">
        <InteractiveHoverButton
          onClick={handleOpenAllMedia}
          className="px-8 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <span>Todas as Mídias</span>

        </InteractiveHoverButton>
      </div>
    </section>
  );
};

export default MediaSection;
