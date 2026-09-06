import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ArrowRight, X, ShieldCheck, Share2, Check } from 'lucide-react';
import { NewsItem } from '../types';
import { ALL_NEWS } from '../data/newsData';
import { ScrollFloat } from './ScrollFloat';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';

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

      {/* Bento Grid News Layout - Optimized with High-Performance Glass Cards */}
      <BentoGrid className="max-w-7xl mx-auto gap-5 sm:gap-7">
        {latestNews.map((item, index) => {
          // Bento layout pattern: Item 0 is 2 cols, Item 1 is 1 col, Item 2 is 1 col, Item 3 is 2 cols
          const isWide = index === 0 || index === 3;

          return (
            <BentoGridItem
              key={item.id}
              className={isWide ? 'md:col-span-2' : 'md:col-span-1'}
              onClick={() => setSelectedNews(item)}
            >
              <div className="p-6 sm:p-8 h-full flex flex-col justify-between group rounded-3xl border border-white/10 bg-neutral-950/80 hover:bg-neutral-900/90 hover:border-[#EEDC9A]/40 transition-all duration-300 shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer">
                <div>
                  {/* Badge & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-4">
                    <span className="px-3 py-1 text-[10px] sm:text-[11px] font-syne font-bold uppercase tracking-wider text-[#EEDC9A] bg-[#EEDC9A]/10 border border-[#EEDC9A]/30 rounded-full shadow-sm">
                      {item.tag}
                    </span>

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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#F6E7B8] group-hover:to-[#EED89F] group-hover:text-black group-hover:border-[#EEDC9A]/50 transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Modal Reader Portaled directly to document.body with Perfect Mobile/Desktop Layout */}
      {selectedNews &&
        createPortal(
          <div
            data-lenis-prevent="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overscroll-contain"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedNews(null);
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              data-lenis-prevent="true"
              className="max-w-2xl w-full max-h-[88vh] flex flex-col rounded-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-[#0c0c10] text-white overflow-hidden my-auto"
            >
              {/* Fixed Modal Header */}
              <div className="p-5 sm:p-7 pb-4 border-b border-white/10 relative flex-shrink-0 bg-[#0c0c10]/95 backdrop-blur-sm pr-14">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/15 transition-all cursor-pointer z-10"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EEDC9A]/15 text-[#EEDC9A] border border-[#EEDC9A]/30 text-[10px] sm:text-xs font-bold font-syne uppercase tracking-wider">
                      {selectedNews.tag}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] text-neutral-300 text-[10px] sm:text-xs border border-white/10">
                      <ShieldCheck className="w-3 h-3 text-[#EEDC9A]" />
                      <span>{selectedNews.category}</span>
                    </span>

                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-400 font-light ml-auto">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>{selectedNews.date}</span>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-bold font-syne text-white leading-snug">
                    {selectedNews.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-5 sm:p-7 flex-1 overflow-y-auto custom-scrollbar text-xs sm:text-sm text-neutral-300 font-light leading-relaxed space-y-4 select-text">
                <p className="whitespace-pre-line leading-relaxed">{selectedNews.content}</p>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 leading-relaxed font-normal">
                  💡 Para mais informações sobre inscrições, credenciamento e acomodação, entre em contato através do formulário de contato abaixo ou WhatsApp oficial.
                </div>
              </div>

              {/* Fixed Modal Footer with Action Buttons */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0c0c10]/95 backdrop-blur-sm flex items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleShare(selectedNews, e)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    {copiedId === selectedNews.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copiado!</span>
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
                    className="text-xs text-[#EEDC9A] hover:underline font-bold uppercase tracking-wider hidden sm:inline"
                  >
                    Ver todas as notícias &gt;
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black text-xs font-black font-syne uppercase tracking-wider shadow-[0_0_15px_rgba(238,220,154,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default NewsSection;

