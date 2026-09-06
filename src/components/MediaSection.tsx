import React from 'react';
import { ScrollFloat } from './ScrollFloat';
import { CircularGallery } from './ui/CircularGallery';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';

interface MediaSectionProps {
  onOpenMediaPage?: () => void;
}

const CIRCULAR_GALLERY_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
    text: 'Roda e Energia'
  },
  {
    image: '/img/cm_soldado.jpg',
    text: 'Contramestre Soldado'
  },
  {
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    text: 'Treino e Movimento'
  },
  {
    image: '/img/mestre_pinheiro.jpg',
    text: 'Mestre Pinheiro'
  },
  {
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
    text: 'Força e Disciplina'
  },
  {
    image: '/img/professor_dom_ruan.jpeg',
    text: 'Professor Dom Ruan'
  },
  {
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    text: 'Toques de Berimbau'
  },
  {
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    text: 'Acrobacias e Floreios'
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    text: 'Cultura Nagô'
  },
  {
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop',
    text: 'Arte Marcial'
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
      <div className="w-full h-[380px] sm:h-[460px] lg:h-[520px] relative overflow-hidden bg-transparent">
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
