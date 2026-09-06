import React, { useState } from 'react';
import { ArrowLeft, Share2, Check, Move3d } from 'lucide-react';
import { DomeGallery } from './ui/DomeGallery';
import { MaskedHeading } from './ui/MaskedHeading';

interface MediaPageProps {
  onBackToHome?: () => void;
}

const MEDIA_GALLERY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1400&auto=format&fit=crop',
    alt: 'Roda de Capoeira e Energia Nagô'
  },
  {
    src: '/img/cm_soldado.jpg',
    alt: 'Contramestre Soldado - Elite Nagô'
  },
  {
    src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1400&auto=format&fit=crop',
    alt: 'Treino e Movimentação Técnica'
  },
  {
    src: '/img/mestre_pinheiro.jpg',
    alt: 'Mestre Pinheiro - Mestre Fundador'
  },
  {
    src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1400&auto=format&fit=crop',
    alt: 'Força, Disciplina e Tradição'
  },
  {
    src: '/img/professor_dom_ruan.jpeg',
    alt: 'Professor Dom Ruan - Elite Nagô'
  },
  {
    src: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1400&auto=format&fit=crop',
    alt: 'Toques de Berimbau e Cantigas'
  },
  {
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1400&auto=format&fit=crop',
    alt: 'Acrobacias, Floreios e Saltos'
  },
  {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop',
    alt: 'Cultura e Expressão Nagô'
  },
  {
    src: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1400&auto=format&fit=crop',
    alt: 'Arte Marcial e Tradição Popular'
  }
];

export const MediaPage: React.FC<MediaPageProps> = ({ onBackToHome }) => {
  const [copied, setCopied] = useState(false);

  const handleGoBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mídias Elite - Galeria 3D',
      text: 'Confira a galeria esférica 3D com fotos, mestres e momentos do Grupo Elite Nagô!',
      url: window.location.href,
    };

    if (navigator.share && typeof navigator.canShare === 'function') {
      try {
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-amber-50 selection:bg-white selection:text-black flex flex-col overflow-x-hidden">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="w-full px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Voltar ao Início</span>
            </button>
          </div>

          <a href="#" onClick={handleGoBack} className="flex items-center gap-2">
            <img
              src="/en.svg"
              alt="Elite Nagô Logo"
              className="h-8 sm:h-9 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(238,220,154,0.3)]"
            />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden xs:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#EEDC9A]" />
                  <span className="hidden xs:inline">Compartilhar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section with MaskedHeading */}
      <div className="relative pt-6 pb-1 px-4 max-w-5xl mx-auto text-center space-y-2">
        <MaskedHeading
          text="MÍDIAS"
          mediaType="video"
          src="/midias/1_midia.mp4"
          align="center"
          weight={900}
          textScale={0.16}
          tracking={-0.01}
          fillScale={1.3}
          parallax={24}
          drift={16}
          reveal="rise"
          duration={1.2}
          trigger="mount"
          className="font-black font-syne uppercase tracking-tight py-1"
        />

        <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-md mx-auto flex items-center justify-center gap-1.5">
          <Move3d className="w-4 h-4 text-[#EEDC9A] shrink-0" />
          <span>Gire a cúpula esférica em 360° e clique nas fotos para ver detalhes.</span>
        </p>
      </div>

      {/* Full-Width 3D Dome Gallery Container Filling Edge-to-Edge */}
      <main className="flex-1 w-full relative overflow-hidden bg-transparent pb-4">
        <div className="w-full h-[calc(100vh-210px)] min-h-[520px] sm:min-h-[640px] relative overflow-hidden bg-transparent">
          <DomeGallery
            images={MEDIA_GALLERY_IMAGES}
            fit={0.65}
            minRadius={560}
            maxRadius={980}
            dragSensitivity={22}
            dragDampening={1.8}
            overlayBlurColor="#050505"
            grayscale={false}
            imageBorderRadius="22px"
            openedImageBorderRadius="24px"
          />
        </div>
      </main>
    </div>
  );
};

export default MediaPage;
