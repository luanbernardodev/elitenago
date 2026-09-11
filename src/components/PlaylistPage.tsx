import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowLeft,
  SearchX,
  Share2,
  Maximize2,
  Volume1,
  Volume2,
  WifiOff,
} from 'lucide-react';
import { RhythmTrack } from '../types';
import { ALL_RHYTHMS } from '../data/rhythmsData';
import { GooeyInput } from './ui/gooey-input';
import { StarBorder } from './ui/StarBorder';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { ElasticSlider } from './ElasticSlider';
import { SpotifyPlayerModal } from './SpotifyPlayerModal';
import { Skeleton } from './ui/skeleton';
import { useNetworkStatus } from '@/lib/useNetworkStatus';

import { playTrack, stopCurrentTrack, setGlobalVolume, seekCurrentTrack } from '@/lib/audioEngine';

interface PlaylistPageProps {
  onBackToHome?: () => void;
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({ onBackToHome }) => {
  const { isOnline } = useNetworkStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [activeTrack, setActiveTrack] = useState<RhythmTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setGlobalVolume(volume);
  }, [volume]);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(ALL_RHYTHMS.map((r) => r.category || 'Outros')));
    return ['TODOS', ...cats];
  }, []);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return ALL_RHYTHMS.filter((track) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        track.name.toLowerCase().includes(q) ||
        track.instrument.toLowerCase().includes(q) ||
        track.tempo.toLowerCase().includes(q) ||
        (track.artist && track.artist.toLowerCase().includes(q)) ||
        (track.category && track.category.toLowerCase().includes(q)) ||
        track.description.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'TODOS' || track.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const togglePlayTrack = (track: RhythmTrack) => {
    if (activeTrack?.id === track.id && isPlaying) {
      stopCurrentTrack();
      setIsPlaying(false);
      return;
    }

    setActiveTrack(track);
    setIsPlaying(true);
    setPlaybackTime(0);

    playTrack(
      track,
      volume,
      (sec) => setPlaybackTime(sec),
      () => handleNextTrack()
    );
  };

  const handleSeek = (time: number) => {
    setPlaybackTime(time);
    seekCurrentTrack(time);
  };

  useEffect(() => {
    return () => {
      stopCurrentTrack();
    };
  }, []);

  const handleNextTrack = () => {
    if (!activeTrack) return;
    const list = filteredTracks.length > 0 ? filteredTracks : ALL_RHYTHMS;
    const currentIndex = list.findIndex((t) => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % list.length;
    togglePlayTrack(list[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (!activeTrack) return;
    const list = filteredTracks.length > 0 ? filteredTracks : ALL_RHYTHMS;
    const currentIndex = list.findIndex((t) => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    togglePlayTrack(list[prevIndex]);
  };

  const handleGoBack = () => {
    stopCurrentTrack();
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const handleShare = (track: RhythmTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${track.name} - Grupo Elite Nagô`,
        text: `Ouça ${track.name} (${track.instrument}) do Grupo Elite Nagô!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${track.name} - ${track.instrument}\nGrupo Elite Nagô de Capoeira`);
      setCopiedId(track.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleTrackRowClick = (track: RhythmTrack) => {
    if (activeTrack?.id === track.id && isPlaying) {
      setIsModalOpen(true);
    } else {
      togglePlayTrack(track);
      setIsModalOpen(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-amber-50 selection:bg-white selection:text-black pb-32">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#08080a]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-white/30 text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
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

      {/* Hero Spotify Playlist Banner */}
      <div className="relative pt-10 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#181820]/90 via-[#0d0d12]/95 to-[#08080a] border border-white/15 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Playlist Cover Art */}
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl bg-neutral-950 border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 relative overflow-hidden group">
            <img
              src={activeTrack?.cover || '/logos/en_thumb.png'}
              alt={activeTrack?.name || 'Playlist Elite Nagô'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logos/en_thumb.png';
              }}
            />
          </div>

          {/* Playlist Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <StarBorder
                as="div"
                color="#EEDC9A"
                speed="4s"
                thickness={1}
                backgroundColor="rgba(20, 20, 25, 0.85)"
                borderColor="rgba(238, 220, 154, 0.3)"
                innerClassName="px-3 py-1 text-[10px] sm:text-xs font-syne font-bold uppercase tracking-wider text-amber-200 shadow-sm"
              >
                Playlist Oficial
              </StarBorder>
              <span className="text-xs text-neutral-400 font-mono">• {ALL_RHYTHMS.length} faixas</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-syne text-white uppercase tracking-tight">
              Ritmos & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887]">Cantigas</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed">
              Acervo musical completo do Grupo Elite Nagô. Ouça e pratique toques de berimbau, corridos, ladainhas ancestrais, samba de roda e maculelê.
            </p>

            {/* Action Buttons: Tocar Tudo + Spotify App Link */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <InteractiveHoverButton
                onClick={() => {
                  const first = filteredTracks[0] || ALL_RHYTHMS[0];
                  togglePlayTrack(first);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-wider"
              >
                {isPlaying ? 'Pausar Reprodução' : 'Tocar Tudo'}
              </InteractiveHoverButton>

              {/* Direct Spotify App Link */}
              <a
                href="https://open.spotify.com/search/capoeira%20elite%20nago"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-black font-syne uppercase tracking-wider shadow-[0_0_20px_rgba(29,185,84,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Abrir no Spotify Oficial"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.093-.804-.162-.897-.565-.093-.404.161-.805.565-.898 4.564-1.042 8.486-.599 11.634 1.343.353.216.464.674.248 1.027zm1.467-3.261c-.27.439-.848.579-1.287.31-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.028-.135-1.179-.633-.151-.497.135-1.028.633-1.179 4.354-1.321 9.774-.68 13.458 1.584.439.27.579.848.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.593.18-1.224-.16-1.404-.753-.18-.593.16-1.224.753-1.404 4.242-1.288 11.278-1.043 15.727 1.597.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
                </svg>
                <span>Spotify</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="mt-8 sm:mt-10">
          <GooeyInput
            placeholder="Pesquisar ritmo, instrumento, corrido, ladainha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Category Filters Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black scale-105'
                  : 'bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Spotify Tracklist Table */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isOnline ? (
          <div className="bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 hover:border-[#EEDC9A]/30 shadow-2xl transition-all duration-300 overflow-hidden">
            {/* Offline Notification */}
            <div className="px-5 sm:px-8 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>Sem conexão de rede. Carregando faixas em cache...</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                OFFLINE
              </span>
            </div>

            {/* Shimmer Skeleton Track Rows */}
            <div className="divide-y divide-white/5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-5 sm:px-8 py-3.5 sm:py-4 items-center"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  </div>
                  <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                    <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-4/5 rounded" />
                      <Skeleton className="h-2.5 w-3/5 rounded" />
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-4 space-y-2">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                  <div className="hidden md:flex col-span-1 items-center justify-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="col-span-5 sm:col-span-3 md:col-span-2 flex items-center justify-end gap-2.5">
                    <Skeleton className="h-3 w-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-neutral-950/60 rounded-3xl border border-dashed border-white/10 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#EEDC9A]">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-syne text-white">Nenhum ritmo ou cantiga encontrada</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Não encontramos resultados para "{searchQuery}". Tente outros termos ou limpe a busca.
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
          <div className="bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 hover:border-[#EEDC9A]/30 shadow-2xl transition-all duration-300 overflow-hidden">
            {/* Track Rows */}
            <div className="divide-y divide-white/5">
              {filteredTracks.map((track, idx) => {
                const isCurrent = activeTrack?.id === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackRowClick(track)}
                    className={`grid grid-cols-12 gap-4 px-5 sm:px-8 py-3.5 sm:py-4 items-center transition-all duration-200 cursor-pointer group ${
                      isCurrent
                        ? 'bg-white/[0.08] text-white shadow-inner'
                        : 'hover:bg-white/[0.04] text-neutral-300'
                    }`}
                  >
                    {/* Index / Play Button Column */}
                    <div className="col-span-1 flex items-center justify-center">
                      {isCurrent ? (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-3.5 bg-[#EEDC9A] rounded-full animate-pulse" />
                          <span className="w-1 h-5 bg-[#EEDC9A] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-2.5 bg-[#EEDC9A] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <span className="group-hover:hidden text-xs font-mono text-neutral-500 font-bold">
                            {idx + 1}
                          </span>
                          <Play className="hidden group-hover:block w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>

                    {/* Title & Artist/Category */}
                    <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={track.cover || '/logos/en_thumb.png'}
                          alt={track.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logos/en_thumb.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-sm sm:text-base font-bold font-syne truncate transition-colors ${
                            isCurrent ? 'text-[#EEDC9A]' : 'text-white group-hover:text-[#EEDC9A]'
                          }`}
                        >
                          {track.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-light truncate">
                          <span>{track.artist || 'Grupo Elite Nagô'}</span>
                          {track.category && (
                            <span className="hidden xs:inline px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-400 border border-white/5">
                              {track.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instruments */}
                    <div className="hidden sm:block col-span-3 text-xs text-neutral-400 truncate">
                      {track.instrument}
                    </div>

                    {/* Tempo / BPM */}
                    <div className="hidden md:block col-span-2 text-xs font-mono text-neutral-400 truncate">
                      {track.tempo}
                    </div>

                    {/* Duration / Action buttons */}
                    <div className="col-span-5 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2 text-right">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent('capoeira elite nago ' + track.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full hover:bg-[#1DB954]/20 text-neutral-400 hover:text-[#1DB954] transition-colors"
                        title={`Ouvir ${track.name} no Spotify`}
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.093-.804-.162-.897-.565-.093-.404.161-.805.565-.898 4.564-1.042 8.486-.599 11.634 1.343.353.216.464.674.248 1.027zm1.467-3.261c-.27.439-.848.579-1.287.31-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.028-.135-1.179-.633-.151-.497.135-1.028.633-1.179 4.354-1.321 9.774-.68 13.458 1.584.439.27.579.848.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.593.18-1.224-.16-1.404-.753-.18-.593.16-1.224.753-1.404 4.242-1.288 11.278-1.043 15.727 1.597.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
                        </svg>
                      </a>

                      <button
                        onClick={(e) => handleShare(track, e)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title={copiedId === track.id ? 'Copiado!' : 'Compartilhar'}
                      >
                        <Share2 className={`w-3.5 h-3.5 ${copiedId === track.id ? 'text-[#EEDC9A]' : ''}`} />
                      </button>

                      <span className="text-xs font-mono text-neutral-400 min-w-[40px]">
                        {track.duration || '3:00'}
                      </span>

                      {/* Play/Pause Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlayTrack(track);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                            : 'bg-white/5 hover:bg-white hover:text-black border border-white/15 text-white'
                        }`}
                      >
                        {isCurrent ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating Spotify Bottom Player Bar when a track is active */}
      {activeTrack && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-8 z-50 animate-fadeIn">
          <div
            onClick={() => setIsModalOpen(true)}
            className="max-w-5xl mx-auto p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#0a0a0f]/95 border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-white/30 transition-all group"
          >
            {/* Left: Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={activeTrack.cover || '/logos/en_thumb.png'}
                  alt={activeTrack.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logos/en_thumb.png';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs sm:text-sm font-bold font-syne text-white truncate group-hover:text-[#EEDC9A] transition-colors">
                  {activeTrack.name}
                </h5>
                <p className="text-[10px] sm:text-xs text-[#EEDC9A] font-mono truncate">
                  {activeTrack.instrument} • {formatSeconds(playbackTime)}
                </p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => togglePlayTrack(activeTrack)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-neutral-950 hover:bg-[#EEDC9A] flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
            </div>

            {/* Right: ElasticSlider Volume Controller (Desktop) & Maximize Modal */}
            <div className="hidden sm:flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="w-40 sm:w-48">
                <ElasticSlider
                  leftIcon={<Volume1 className="w-3.5 h-3.5 text-[#EEDC9A]" />}
                  rightIcon={<Volume2 className="w-3.5 h-3.5 text-[#EEDC9A]" />}
                  startingValue={0}
                  defaultValue={70}
                  value={volume}
                  maxValue={100}
                  showVolumeText={false}
                  onChange={(val) => setVolume(val)}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Expandir Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotify Modal when track is clicked */}
      <SpotifyPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        track={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayTrack}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        volume={volume}
        onVolumeChange={setVolume}
        playbackTime={playbackTime}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default PlaylistPage;
