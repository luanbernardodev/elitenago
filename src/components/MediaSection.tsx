import React, { useEffect, useState } from 'react';
import { CircularGallery } from './ui/CircularGallery';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { supabase, DatabaseMedia } from '../lib/supabase';

interface MediaSectionProps {
  onOpenMediaPage?: () => void;
}

const DEFAULT_GALLERY_ITEMS = [
  { image: 'https://i.imgur.com/A46hzMt.jpeg', text: '' },
  { image: '/img/cm_soldado.jpg', text: '' },
  { image: 'https://i.imgur.com/RWa2XaP.jpeg', text: '' },
  { image: '/img/mestre_pinheiro.jpg', text: '' },
  { image: 'https://i.imgur.com/TOTCg4x.jpeg', text: '' },
  { image: '/img/professor_dom_ruan.jpeg', text: '' },
  { image: 'https://i.imgur.com/IiYz7yh.jpeg', text: '' },
  { image: 'https://i.imgur.com/phPJ0Qh.jpeg', text: '' },
  { image: 'https://i.imgur.com/N3HsBOJ.jpeg', text: '' },
  { image: 'https://i.imgur.com/JtVhftz.jpeg', text: '' }
];

export const MediaSection: React.FC<MediaSectionProps> = ({ onOpenMediaPage }) => {
  const [galleryItems, setGalleryItems] = useState<{ image: string; text: string }[]>(DEFAULT_GALLERY_ITEMS);

  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const { data, error } = await supabase
          .from('medias')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Filter STRICTLY for photos only on homepage (ignore videos and audios for clean visual aesthetic)
          const photoMedias = data.filter((m: DatabaseMedia) => {
            const isVideo = m.file_type === 'video' || m.type === 'video';
            const isAudio = m.type === 'music' || m.file_type === 'audio';
            const hasValidImage = m.url && !m.url.endsWith('.mp4') && !m.url.endsWith('.webm');
            return !isVideo && !isAudio && hasValidImage;
          });

          // Map to 3D gallery items with text: '' (no titles on homepage cards)
          const dynamicItems = photoMedias.map((m: DatabaseMedia) => {
            return {
              image: m.url || m.thumbnail_url || 'https://i.imgur.com/A46hzMt.jpeg',
              text: '', // No title displayed on homepage carousel
            };
          });

          // Merge with default items to ensure a rich 10-item photo carousel
          const combined = [...dynamicItems, ...DEFAULT_GALLERY_ITEMS];
          const unique = Array.from(new Map(combined.map(item => [item.image, item])).values()).slice(0, 10);
          setGalleryItems(unique);
        }
      } catch (err) {
        console.warn('Erro ao carregar mídias recentes do Supabase:', err);
      }
    };

    fetchMedias();

    // Realtime subscription for instant updates when admin uploads media
    const channel = supabase
      .channel('home-media-section')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medias' }, () => {
        fetchMedias();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenAllMedia = () => {
    if (onOpenMediaPage) {
      onOpenMediaPage();
    } else {
      window.open('?view=midias', '_self');
    }
  };

  return (
    <section
      id="midias"
      className="relative py-14 sm:py-20 w-full overflow-hidden z-10"
    >


      {/* Circular Gallery Container with Edge Fades */}
      <div className="w-full h-[380px] sm:h-[460px] lg:h-[520px] relative overflow-hidden bg-transparent select-none touch-pan-y">
        {/* Left Side Smooth Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 lg:w-48 z-10 pointer-events-none bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />

        {/* Right Side Smooth Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 lg:w-48 z-10 pointer-events-none bg-gradient-to-l from-[#050505] via-[#050505]/70 to-transparent" />

        <CircularGallery
          key={galleryItems.length}
          items={galleryItems}
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

