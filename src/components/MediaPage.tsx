import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  Check,
  Download,
  Play,
  Image as ImageIcon,
  LayoutGrid,
  Globe2,
  ChevronLeft,
  ChevronRight,
  SearchX,
  X,
  Sparkles,
  User,
  Film
} from 'lucide-react';
import { DomeGallery } from './ui/DomeGallery';
import { GooeyInput } from './ui/gooey-input';
import { supabase, triggerFileDownload, DatabaseMedia } from '../lib/supabase';

interface MediaPageProps {
  onBackToHome?: () => void;
}

const ITEMS_PER_PAGE = 8;

const CATEGORIES = [
  'TODOS',
  'FOTOS',
  'VÍDEOS',
  'BATIZADOS & RODAS',
  'AULAS & TREINOS',
  'HISTÓRICO & TRADIÇÃO'
];

const DEFAULT_GALLERY_IMAGES = [
  {
    id: 'def-1',
    title: 'Roda de Capoeira e Energia Nagô',
    type: 'image',
    file_type: 'photo',
    author: 'Grupo Elite Nagô',
    category: 'Batizados & Rodas',
    description: 'Tradição, energia e fundamentos na roda de capoeira.',
    url: 'https://i.imgur.com/N3HsBOJ.jpeg',
    thumbnail_url: 'https://i.imgur.com/N3HsBOJ.jpeg',
    file_size: '2.8 MB',
    original_filename: 'roda_de_capoeira_nago.jpg',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'def-2',
    title: 'Contramestre Soldado - Elite Nagô',
    type: 'image',
    file_type: 'photo',
    author: 'Contramestre Soldado',
    category: 'Histórico & Tradição',
    description: 'Liderança, dedicação e preservação da arte da capoeira.',
    url: '/img/cm_soldado.jpg',
    thumbnail_url: '/img/cm_soldado.jpg',
    file_size: '1.9 MB',
    original_filename: 'cm_soldado.jpg',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'def-3',
    title: 'Treino e Movimentação Técnica',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Aulas e Treinos',
    description: 'Aprimoramento constante de acrobacias e esquivas.',
    url: 'https://i.imgur.com/RWa2XaP.jpeg',
    thumbnail_url: 'https://i.imgur.com/RWa2XaP.jpeg',
    file_size: '3.1 MB',
    original_filename: 'treino_movimentacao.jpg',
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'def-4',
    title: 'Mestre Pinheiro - Fundador',
    type: 'image',
    file_type: 'photo',
    author: 'Mestre Pinheiro',
    category: 'Histórico & Tradição',
    description: 'Mestre fundador e pioneiro da linhagem Elite Nagô.',
    url: '/img/mestre_pinheiro.jpg',
    thumbnail_url: '/img/mestre_pinheiro.jpg',
    file_size: '2.2 MB',
    original_filename: 'mestre_pinheiro.jpg',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'def-5',
    title: 'Força, Disciplina e Tradição',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Batizados & Rodas',
    description: 'A força da união e o respeito às raízes afro-brasileiras.',
    url: 'https://i.imgur.com/A46hzMt.jpeg',
    thumbnail_url: 'https://i.imgur.com/A46hzMt.jpeg',
    file_size: '2.5 MB',
    original_filename: 'disciplina_tradicao.jpg',
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'def-6',
    title: 'Professor Dom Ruan - Elite Nagô',
    type: 'image',
    file_type: 'photo',
    author: 'Professor Dom Ruan',
    category: 'Histórico & Tradição',
    description: 'Dedicação ao ensino infantil e formação de novos capoeiristas.',
    url: '/img/professor_dom_ruan.jpeg',
    thumbnail_url: '/img/professor_dom_ruan.jpeg',
    file_size: '1.8 MB',
    original_filename: 'professor_dom_ruan.jpeg',
    created_at: '2025-12-20T10:00:00Z',
  },
  {
    id: 'def-7',
    title: 'Graduações e Entrega de Cordas',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Batizados & Rodas',
    description: 'Momento solene de graduação e reconhecimento dos alunos.',
    url: 'https://i.imgur.com/JtVhftz.jpeg',
    thumbnail_url: 'https://i.imgur.com/JtVhftz.jpeg',
    file_size: '3.4 MB',
    original_filename: 'graduacoes_cordas.jpg',
    created_at: '2025-11-15T10:00:00Z',
  },
  {
    id: 'def-8',
    title: 'Acrobacias, Floreios e Saltos',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Aulas e Treinos',
    description: 'Técnica e agilidade nos movimentos acrobáticos e de solo.',
    url: 'https://i.imgur.com/TOTCg4x.jpeg',
    thumbnail_url: 'https://i.imgur.com/TOTCg4x.jpeg',
    file_size: '3.0 MB',
    original_filename: 'acrobacias_floreios.jpg',
    created_at: '2025-10-10T10:00:00Z',
  },
  {
    id: 'def-9',
    title: 'Cultura e Expressão Nagô',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Batizados & Rodas',
    description: 'Celebração da cultura popular e arte marcial em Juiz de Fora.',
    url: 'https://i.imgur.com/IiYz7yh.jpeg',
    thumbnail_url: 'https://i.imgur.com/IiYz7yh.jpeg',
    file_size: '2.7 MB',
    original_filename: 'cultura_expressao.jpg',
    created_at: '2025-09-05T10:00:00Z',
  },
  {
    id: 'def-10',
    title: 'Arte Marcial e Tradição Popular',
    type: 'image',
    file_type: 'photo',
    author: 'Elite Nagô',
    category: 'Histórico & Tradição',
    description: 'Ginga, mandinga e superação através da capoeira.',
    url: 'https://i.imgur.com/phPJ0Qh.jpeg',
    thumbnail_url: 'https://i.imgur.com/phPJ0Qh.jpeg',
    file_size: '2.9 MB',
    original_filename: 'arte_tradicao.jpg',
    created_at: '2025-08-01T10:00:00Z',
  }
];

export const MediaPage: React.FC<MediaPageProps> = ({ onBackToHome }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'dome'>('grid');
  const [copied, setCopied] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected Modal Lightbox
  const [previewMedia, setPreviewMedia] = useState<DatabaseMedia | null>(null);

  // Supabase Media items
  const [dbMedias, setDbMedias] = useState<DatabaseMedia[]>([]);
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllMedias = async () => {
      try {
        const { data, error } = await supabase
          .from('medias')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // STRICT FILTER: Only Photos and Videos (remove all audios/musics)
          const visualOnly = data.filter((m: DatabaseMedia) => {
            const isAudio = m.type === 'music' || m.file_type === 'audio';
            return !isAudio && (m.url || m.thumbnail_url);
          });
          setDbMedias(visualOnly);
        } else {
          setDbMedias(DEFAULT_GALLERY_IMAGES as any);
        }
      } catch (err) {
        console.warn('Erro ao carregar mídias do Supabase:', err);
        setDbMedias(DEFAULT_GALLERY_IMAGES as any);
      }
    };

    fetchAllMedias();

    const channel = supabase
      .channel('medias-page-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medias' }, () => {
        fetchAllMedias();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Combined medias with fallback defaults (strictly visual: photos and videos only)
  const allMediaItems = useMemo(() => {
    if (dbMedias.length === 0) return DEFAULT_GALLERY_IMAGES as any;
    const existingUrls = new Set(dbMedias.map(m => m.url));
    const defaultsToAdd = (DEFAULT_GALLERY_IMAGES as any).filter((d: any) => !existingUrls.has(d.url));
    return [...dbMedias, ...defaultsToAdd];
  }, [dbMedias]);

  // Filtered Media List (photos & videos only)
  const filteredMedias = useMemo(() => {
    return allMediaItems.filter((item: DatabaseMedia) => {
      const isVideo = item.file_type === 'video' || item.type === 'video';
      const isPhoto = !isVideo;

      // Category / Type matching
      if (selectedCategory === 'FOTOS' && !isPhoto) return false;
      if (selectedCategory === 'VÍDEOS' && !isVideo) return false;
      if (selectedCategory === 'BATIZADOS & RODAS' && item.category !== 'Batizados & Rodas') return false;
      if (selectedCategory === 'AULAS & TREINOS' && item.category !== 'Aulas e Treinos') return false;
      if (selectedCategory === 'HISTÓRICO & TRADIÇÃO' && item.category !== 'Histórico & Tradição') return false;

      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchAuthor = item.author?.toLowerCase().includes(query);
        const matchCategory = item.category?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchAuthor && !matchCategory && !matchDesc) return false;
      }

      return true;
    });
  }, [allMediaItems, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredMedias.length / ITEMS_PER_PAGE));

  const paginatedMedias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedias.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMedias, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // 3D Dome Gallery Images (Photos and Videos with full preview support)
  const domeGalleryImages = useMemo(() => {
    return allMediaItems.map((m: DatabaseMedia) => {
      const isVideo = m.file_type === 'video' || m.type === 'video' || (m.url && (m.url.endsWith('.mp4') || m.url.endsWith('.webm')));
      const thumb = isVideo
        ? (m.thumbnail_url && !m.thumbnail_url.includes('en_thumb') ? m.thumbnail_url : (m.url || 'https://i.imgur.com/A46hzMt.jpeg'))
        : (m.url || m.thumbnail_url || 'https://i.imgur.com/A46hzMt.jpeg');

      return {
        src: thumb,
        alt: m.title || 'Mídia Elite Nagô',
        isVideo: Boolean(isVideo),
        videoUrl: isVideo ? m.url : undefined,
        title: m.title,
        mediaData: m,
      };
    });
  }, [allMediaItems]);

  const handleGoBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mídias e Galeria - Grupo Elite Nagô',
      text: 'Confira as fotos e vídeos oficiais do Grupo Elite Nagô e faça o download direto dos arquivos!',
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
    } catch { }
  };

  const handleDownload = async (item: DatabaseMedia, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.url) return;

    setDownloadingId(item.id);
    const isVideo = item.file_type === 'video' || item.type === 'video';
    const ext = isVideo ? 'mp4' : 'jpg';
    const safeName = item.original_filename || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.${ext}`;

    await triggerFileDownload(item.url, safeName, item.id);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-amber-50 selection:bg-white selection:text-black flex flex-col overflow-x-hidden">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#08080a]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
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

      {/* Hero Header Section */}
      <div className="relative py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-syne text-white uppercase tracking-tight">
            Mídias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887]">Galeria</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            Explore as fotos e vídeos oficiais do Grupo Elite Nagô. Todos os arquivos estão liberados para download direto em alta resolução.
          </p>
        </div>

        {/* Search Bar with GooeyInput Component */}
        <div className="mt-8 sm:mt-10">
          <GooeyInput
            placeholder="Pesquisar fotos, vídeos, batizados, treinos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Bar: Category Badges + View Mode Switcher */}
        <div
          ref={listTopRef}
          className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10"
        >
          {/* Category Badges Filter (Identical styling to NewsPage) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
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

          {/* View Mode Selector: Grade vs 3D Domo */}
          <div className="flex items-center gap-1.5 shrink-0 bg-neutral-900/90 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Exibição em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>GRADE</span>
            </button>

            <button
              onClick={() => setViewMode('dome')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'dome'
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Exibição em 3D Domo Imersivo"
            >
              <Globe2 className="w-4 h-4" />
              <span>3D DOMO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'dome' ? (
        /* MODE A: 3D DOME IMMERSIVE GALLERY */
        <main className="flex-1 w-full relative overflow-hidden bg-transparent pb-10">
          <div className="flex justify-center px-4 mb-4">
            <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs text-neutral-300 flex items-center gap-2 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Arraste para girar a esfera em 360° • Clique na foto ou vídeo para expandir e baixar</span>
            </div>
          </div>

          <div className="w-full h-[calc(100vh-140px)] min-h-[560px] sm:min-h-[680px] relative overflow-hidden bg-transparent">
            <DomeGallery
              images={domeGalleryImages}
              fit={0.65}
              minRadius={560}
              maxRadius={980}
              dragSensitivity={22}
              dragDampening={1.8}
              overlayBlurColor="#050505"
              grayscale={false}
              imageBorderRadius="22px"
              openedImageBorderRadius="24px"
              onItemClick={(media) => setPreviewMedia(media)}
            />
          </div>
        </main>
      ) : (
        /* MODE B: GRID AND PAGINATION */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-1">
          {filteredMedias.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-neutral-950/60 rounded-3xl border border-dashed border-white/10 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#EEDC9A]">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-syne text-white">Nenhuma mídia encontrada</h3>
              <p className="text-neutral-400 text-sm max-w-md mx-auto">
                Não encontramos fotos ou vídeos para "{searchQuery}". Tente usar outros termos ou limpar os filtros.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('TODOS');
                  setCurrentPage(1);
                }}
                className="mt-2 px-5 py-2 rounded-full bg-white/10 text-neutral-200 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/20"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Media Cards Grid (Photos & Videos only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedMedias.map((item: DatabaseMedia) => {
                  const isVideo = item.file_type === 'video' || item.type === 'video';
                  const isDownloading = downloadingId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewMedia(item)}
                      className="group rounded-3xl bg-[#0e0e14]/80 hover:bg-[#12121b] border border-white/10 hover:border-amber-400/40 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl cursor-pointer"
                    >
                      {/* Media Thumbnail Container */}
                      <div className="relative aspect-4/3 w-full bg-neutral-900 overflow-hidden">
                        {isVideo ? (
                          <div className="w-full h-full bg-neutral-900 relative">
                            {item.thumbnail_url && !item.thumbnail_url.includes('en_thumb') ? (
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <video
                                src={`${item.url}#t=0.5`}
                                className="w-full h-full object-cover pointer-events-none"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 ml-0.5 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url || item.thumbnail_url || 'https://i.imgur.com/A46hzMt.jpeg'}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase backdrop-blur-md flex items-center gap-1 ${
                            isVideo ? 'bg-indigo-500/90 text-white' : 'bg-teal-500/90 text-black'
                          }`}>
                            {isVideo ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            {isVideo ? 'Vídeo' : 'Foto'}
                          </span>

                          {item.file_size && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-black/70 backdrop-blur-md text-neutral-300 border border-white/15">
                              {item.file_size}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Media Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-[10px] text-amber-300/80 font-semibold mb-1 uppercase tracking-wider">
                            {item.category || 'Galeria Oficial'}
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] truncate">
                            <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{item.author || 'Elite Nagô'}</span>
                          </div>

                          {item.url && (
                            <button
                              type="button"
                              onClick={(e) => handleDownload(item, e)}
                              disabled={isDownloading}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                              title="Baixar arquivo original"
                            >
                              {isDownloading ? (
                                <span className="animate-pulse">Baixando...</span>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Baixar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Responsive Pagination (Identical to NewsPage) */}
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedias.length)}
                    </span>{' '}
                    de <span className="text-white font-bold">{filteredMedias.length}</span> mídias
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentPage === 1
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
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === pageNum
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
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentPage === totalPages
                          ? 'opacity-30 cursor-not-allowed text-neutral-500 bg-white/5 border border-white/5'
                          : 'bg-neutral-900 text-neutral-200 hover:bg-white hover:text-black border border-white/10 shadow-sm'
                      }`}
                      aria-label="Próxima página"
                    >
                      <span className="hidden xs:inline">Próximo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* MODAL PREVIEW LIGHTBOX (Photos & Videos only) */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#0e0e14] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-black/40">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {previewMedia.category || 'Mídia Elite Nagô'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-syne mt-1">
                  {previewMedia.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {previewMedia.url && (
                  <button
                    onClick={() => handleDownload(previewMedia)}
                    className="px-4 py-2 rounded-2xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo {previewMedia.file_size ? `(${previewMedia.file_size})` : ''}</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Media Preview */}
            <div className="relative bg-black flex items-center justify-center max-h-[60vh] sm:max-h-[65vh] overflow-hidden">
              {previewMedia.file_type === 'video' || previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <img
                  src={previewMedia.url || previewMedia.thumbnail_url}
                  alt={previewMedia.title}
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0a0a0f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
              <div>
                <p className="text-white font-semibold">{previewMedia.description || 'Mídia Oficial do Grupo Elite Nagô'}</p>
                <p className="text-neutral-500 mt-0.5">Autor: {previewMedia.author || 'Elite Nagô'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPage;

