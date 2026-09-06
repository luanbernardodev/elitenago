import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ArrowRight, X, ShieldCheck, Share2, Check } from 'lucide-react';
import { NewsItem } from '../types';
import { ALL_NEWS } from '../data/newsData';
import { ScrollFloat } from './ScrollFloat';
import { BorderGlow } from './BorderGlow';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { StarBorder } from './ui/StarBorder';

interface NewsSectionProps {
  onOpenNewsPage?: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onOpenNewsPage }) => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 4 latest news items
  const latestNews = ALL_NEWS.slice(0, 4);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (selectedNews) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedNews(null);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedNews]);

  const handleOpenAllNews = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenNewsPage) {
      onOpenNewsPage();
    } else {
      window.open('?view=noticias', '_blank');
    }
  };

  const handleShare = useCallback(async (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=noticias`;
    const shareData = {
      title: item.title,
      text: `${item.title} - ${item.summary}`,
      url: shareUrl,
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

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\n${shareUrl}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore copy errors
    }
  }, []);

  return (
    <section id="noticias" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex justify-center items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Notícias
        </ScrollFloat>
      </div>

      {/* Bento Grid News Layout */}
      <BentoGrid className="max-w-7xl mx-auto gap-6 sm:gap-8">
        {latestNews.map((item, index) => {
          // Bento layout pattern: Item 0 is 2 cols, Item 1 is 1 col, Item 2 is 1 col, Item 3 is 2 cols
          const isWide = index === 0 || index === 3;

          return (
            <BentoGridItem
              key={item.id}
              className={isWide ? 'md:col-span-2' : 'md:col-span-1'}
              onClick={() => setSelectedNews(item)}
            >
              <BorderGlow
                borderRadius={24}
                glowColor="45 50 65"
                backgroundColor="#08080a"
                colors={['#F6E7B8', '#EED89F', '#E3C887']}
                className="p-6 sm:p-8 h-full flex flex-col justify-between group hover:shadow-2xl transition-all duration-300"
              >
                <div>
                  {/* Badge & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-4">
                    <StarBorder
                      as="div"
                      color="#EEDC9A"
                      speed="4s"
                      thickness={1}
                      backgroundColor="rgba(20, 20, 25, 0.85)"
                      borderColor="rgba(238, 220, 154, 0.3)"
                      innerClassName="px-3 py-1 text-[10px] sm:text-[11px] font-syne font-bold uppercase tracking-wider text-amber-200 shadow-sm"
                    >
                      {item.tag}
                    </StarBorder>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-light">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-bold font-syne text-white group-hover:text-[#EEDC9A] transition-colors mb-3 leading-snug ${
                      isWide ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
                    }`}
                  >
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed mb-6">
                    {item.summary}
                  </p>
                </div>

                {/* Card Action Link & Mobile Share Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-200">
                  <span className="group-hover:text-[#EEDC9A] transition-colors text-[11px] sm:text-xs">
                    Ler Notícia Completa
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Share Button beside modal trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(item, e)}
                      className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-neutral-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-90"
                      title="Compartilhar notícia"
                      aria-label="Compartilhar notícia"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-[#EEDC9A]" />
                      )}
                    </button>

                    {/* Open Modal Button */}
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </BentoGridItem>
          );
        })}
      </BentoGrid>

      {/* "Mais Notícias" Button */}
      <div className="mt-12 sm:mt-16 flex justify-center items-center">
        <InteractiveHoverButton
          onClick={handleOpenAllNews}
          className="px-8 py-3.5 text-xs sm:text-sm"
        >
          Mais Notícias
        </InteractiveHoverButton>
      </div>

      {/* Modal Reader Portaled directly to document.body with Body Lock & High Performance */}
      {selectedNews &&
        createPortal(
          <div
            data-lenis-prevent="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedNews(null);
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              data-lenis-prevent="true"
              className="max-w-2xl w-full max-h-[85vh] my-auto overflow-y-auto modal-scrollbar overscroll-contain rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-4 sm:space-y-6 bg-[#0c0c10] text-white select-text"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/15 transition-all cursor-pointer z-10"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="space-y-3 pr-8">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <StarBorder
                    as="div"
                    color="#f59e0b"
                    speed="4s"
                    thickness={1}
                    backgroundColor="rgba(20, 20, 25, 0.85)"
                    borderColor="rgba(245, 158, 11, 0.35)"
                    innerClassName="px-3.5 py-1 text-xs font-syne font-bold uppercase tracking-wider text-amber-200"
                  >
                    {selectedNews.tag}
                  </StarBorder>

                  <span className="text-xs text-neutral-400 font-light">
                    {selectedNews.date}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-syne text-white leading-snug">
                  {selectedNews.title}
                </h2>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-neutral-300 text-xs border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedNews.category}</span>
                </div>
              </div>

              <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm text-neutral-300 font-light leading-relaxed space-y-4 pt-4 border-t border-white/10 whitespace-pre-line">
                <p>{selectedNews.content}</p>
                <p>
                  Para mais informações sobre inscrições, credenciamento de mestres e acomodação para caravanas, entre em contato diretamente com nossa secretaria através do formulário de contato abaixo ou WhatsApp oficial.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleShare(selectedNews, e)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedId === selectedNews.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#EEDC9A]" />
                        <span>Compartilhar</span>
                      </>
                    )}
                  </button>

                  <a
                    href="?view=noticias"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      setSelectedNews(null);
                      handleOpenAllNews(e);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-bold uppercase tracking-wider hidden sm:inline"
                  >
                    Ver todas as notícias &gt;
                  </a>
                </div>

                <InteractiveHoverButton
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Entendido
                </InteractiveHoverButton>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default NewsSection;

