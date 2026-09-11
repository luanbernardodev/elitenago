import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  ArrowRight,
  X,
  ShieldCheck,
  LayoutGrid,
  List as ListIcon,
  ArrowLeft,
  Share2,
  Check,
  SearchX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NewsItem } from '../types';
import { ALL_NEWS } from '../data/newsData';
import { GooeyInput } from './ui/gooey-input';
import { StarBorder } from './ui/StarBorder';

interface NewsPageProps {
  onBackToHome?: () => void;
}

const ITEMS_PER_PAGE = 4;

export const NewsPage: React.FC<NewsPageProps> = ({ onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [desktopViewMode, setDesktopViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const listTopRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(ALL_NEWS.map((n) => n.category)));
    return ['TODOS', ...cats];
  }, []);

  // Filter news by search query and category
  const filteredNews = useMemo(() => {
    return ALL_NEWS.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'TODOS' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleShare = async (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
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

    try {
      await navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\n${shareUrl}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore copy errors
    }
  };

  const handleGoBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-amber-50 selection:bg-white selection:text-black">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#08080a]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
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
        </div>
      </header>

      {/* Hero Header Section */}
      <div className="relative py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-syne text-white uppercase tracking-tight">
            Notícias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887]">Eventos</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            Fique por dentro de todos os eventos do Grupo Elite Nagô.
          </p>
        </div>

        {/* Search Bar with GooeyInput Component */}
        <div className="mt-8 sm:mt-10">
          <GooeyInput
            placeholder="Pesquisar notícias, cursos, batizados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Filter Bar: Categories + Desktop-only Grid/List Toggle */}
        <div
          ref={listTopRef}
          className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10"
        >
          {/* Category Badges Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black scale-105'
                    : 'bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Selector: Visible strictly on Desktop (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 bg-neutral-900/90 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setDesktopViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                desktopViewMode === 'grid'
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Exibição em Grade"
              aria-label="Exibição em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>GRADE</span>
            </button>

            <button
              onClick={() => setDesktopViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                desktopViewMode === 'list'
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Exibição em Lista"
              aria-label="Exibição em Lista"
            >
              <ListIcon className="w-4 h-4" />
              <span>LISTA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredNews.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-neutral-950/60 rounded-3xl border border-dashed border-white/10 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#EEDC9A]">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-syne text-white">Nenhuma notícia encontrada</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Não encontramos resultados para "{searchQuery}". Tente usar outros termos ou limpar os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('TODOS');
              }}
              className="mt-2 px-5 py-2 rounded-full bg-white/10 text-neutral-200 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/20"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div>
            {/* News Items Display */}
            {/* MOBILE: Always rendered as List */}
            {/* DESKTOP: Rendered according to desktopViewMode ('grid' or 'list') */}
            <div
              className={
                desktopViewMode === 'grid'
                  ? 'flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-2'
                  : 'space-y-6'
              }
            >
              {paginatedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="cursor-pointer h-full"
                >
                  {/* MOBILE & DESKTOP LIST LAYOUT */}
                  {desktopViewMode === 'list' ? (
                    <div className="p-5 sm:p-7 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/75 hover:border-[#EEDC9A]/40 transition-all duration-300 shadow-2xl hover:shadow-[0_15px_35px_rgba(0,0,0,0.9)] group">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
                        <div className="flex-1 space-y-3">
                          {/* Badge & Date */}
                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <StarBorder
                              as="div"
                              color="#EEDC9A"
                              speed="4s"
                              thickness={1}
                              backgroundColor="rgba(15, 15, 20, 0.95)"
                              borderColor="rgba(238, 220, 154, 0.35)"
                              innerClassName="px-3 py-1 text-[10px] sm:text-xs font-syne font-bold uppercase tracking-wider text-[#EEDC9A] shadow-sm"
                            >
                              {item.tag}
                            </StarBorder>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] text-neutral-300 text-xs border border-white/10">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#EEDC9A]" />
                              {item.category}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-light ml-auto lg:ml-0">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{item.date}</span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-2xl font-bold font-syne text-white group-hover:text-[#EEDC9A] transition-colors leading-snug">
                            {item.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                            {item.summary}
                          </p>

                          {/* Snippet from full description */}
                          <div className="pt-2 text-xs text-neutral-400 line-clamp-2 border-t border-white/5 hidden sm:block">
                            {item.content}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6">
                          <button
                            onClick={(e) => handleShare(item, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{copiedId === item.id ? 'Copiado!' : 'Compartilhar'}</span>
                          </button>

                          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white group-hover:bg-[#EEDC9A] text-neutral-950 group-hover:text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">
                            <span>Ver Detalhes</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* DESKTOP GRID / MOBILE LIST RESPONSIVE CARD */
                    <div className="p-5 sm:p-7 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/75 hover:border-[#EEDC9A]/40 transition-all duration-300 shadow-2xl hover:shadow-[0_15px_35px_rgba(0,0,0,0.9)] h-full flex flex-col justify-between group">
                      <div>
                        {/* Badge & Date */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                          <StarBorder
                            as="div"
                            color="#EEDC9A"
                            speed="4s"
                            thickness={1}
                            backgroundColor="rgba(15, 15, 20, 0.95)"
                            borderColor="rgba(238, 220, 154, 0.35)"
                            innerClassName="px-3 py-1 text-[10px] sm:text-[11px] font-syne font-bold uppercase tracking-wider text-[#EEDC9A] shadow-sm"
                          >
                            {item.tag}
                          </StarBorder>

                          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-light">
                            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{item.date}</span>
                          </div>
                        </div>

                        {/* Category Label */}
                        <div className="text-[11px] font-mono font-semibold uppercase text-[#EEDC9A]/80 mb-1">
                          {item.category}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold font-syne text-white group-hover:text-[#EEDC9A] transition-colors mb-3 leading-snug">
                          {item.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed mb-6">
                          {item.summary}
                        </p>
                      </div>

                      {/* Card Action Link */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-200">
                        <span className="group-hover:text-[#EEDC9A] transition-colors">Descrição Completa</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleShare(item, e)}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                            title="Compartilhar"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#F6E7B8] group-hover:to-[#EED89F] group-hover:text-black group-hover:border-[#EEDC9A]/50 transition-all shadow-sm">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Component: Fully Responsive for Desktop and Mobile */}
            {totalPages > 1 && (
              <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0a0e]/90 border border-white/10 shadow-xl backdrop-blur-md">
                {/* Result counter info */}
                <div className="text-xs font-mono text-neutral-400 order-2 sm:order-1 text-center sm:text-left">
                  Mostrando{' '}
                  <span className="text-[#EEDC9A] font-bold">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{' '}
                  a{' '}
                  <span className="text-[#EEDC9A] font-bold">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredNews.length)}
                  </span>{' '}
                  de <span className="text-white font-bold">{filteredNews.length}</span> notícias
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPage === 1
                        ? 'opacity-30 cursor-not-allowed text-neutral-500 bg-white/5 border border-white/5'
                        : 'bg-neutral-900 text-neutral-200 hover:bg-white hover:text-black border border-white/10 shadow-sm'
                      }`}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Anterior</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${currentPage === pageNum
                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] font-black scale-105'
                            : 'bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/5'
                          }`}
                        aria-label={`Ir para a página ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPage === totalPages
                        ? 'opacity-30 cursor-not-allowed text-neutral-500 bg-white/5 border border-white/5'
                        : 'bg-neutral-900 text-neutral-200 hover:bg-white hover:text-black border border-white/10 shadow-sm'
                      }`}
                    aria-label="Próxima página"
                  >
                    <span className="hidden xs:inline">Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Reader for Complete Description & Details */}
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
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <StarBorder
                      as="div"
                      color="#EEDC9A"
                      speed="4s"
                      thickness={1}
                      backgroundColor="rgba(15, 15, 20, 0.95)"
                      borderColor="rgba(238, 220, 154, 0.35)"
                      innerClassName="px-2.5 py-0.5 text-[10px] sm:text-xs font-syne font-bold uppercase tracking-wider text-[#EEDC9A]"
                    >
                      {selectedNews.tag}
                    </StarBorder>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] text-neutral-300 text-[10px] sm:text-xs border border-white/10">
                      <ShieldCheck className="w-3 h-3 text-[#EEDC9A]" />
                      <span>{selectedNews.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-400 font-light">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
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

                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black text-xs font-black font-syne uppercase tracking-wider shadow-[0_0_15px_rgba(238,220,154,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Fechar Leitura
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NewsPage;
