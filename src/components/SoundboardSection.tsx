import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Clock3, Volume2, Volume1, Share2, Disc3 } from 'lucide-react';
import { RhythmTrack } from '../types';
import { ALL_RHYTHMS } from '../data/rhythmsData';
import { ScrollFloat } from './ScrollFloat';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { ElasticSlider } from './ElasticSlider';
import { SpotifyPlayerModal } from './SpotifyPlayerModal';

interface SoundboardSectionProps {
  onOpenPlaylistPage?: () => void;
}

export const SoundboardSection: React.FC<SoundboardSectionProps> = ({ onOpenPlaylistPage }) => {
  // Top 4 initial featured rhythms
  const featuredRhythms = ALL_RHYTHMS.slice(0, 4);

  const [activeTrack, setActiveTrack] = useState<RhythmTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const volumeRef = useRef<number>(70);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Web Audio API playback
  const togglePlayTrack = (track: RhythmTrack) => {
    if (activeTrack?.id === track.id && isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();
    setActiveTrack(track);
    setIsPlaying(true);
    setPlaybackTime(0);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();

      let step = 0;
      intervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const isBeat = track.pattern[step % track.pattern.length] === 1;

        if (isBeat) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const currentVol = (volumeRef.current / 100) * 0.45;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(track.freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(track.freq * 1.5, ctx.currentTime + 0.12);

          gain.gain.setValueAtTime(currentVol, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }

        step++;
      }, 250);

      timerRef.current = setInterval(() => {
        setPlaybackTime((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  };

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleNextTrack = () => {
    if (!activeTrack) return;
    const currentIndex = featuredRhythms.findIndex((t) => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % featuredRhythms.length;
    togglePlayTrack(featuredRhythms[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (!activeTrack) return;
    const currentIndex = featuredRhythms.findIndex((t) => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + featuredRhythms.length) % featuredRhythms.length;
    togglePlayTrack(featuredRhythms[prevIndex]);
  };

  const handleShare = (track: RhythmTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${track.name} - Grupo Elite Nagô`,
        text: `Ouça ${track.name} (${track.instrument}) do Grupo Elite Nagô!`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(`${track.name} - ${track.instrument}\nGrupo Elite Nagô de Capoeira`);
      setCopiedId(track.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenPlaylistPage) {
      onOpenPlaylistPage();
    } else {
      window.open('?view=playlist', '_blank');
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

  return (
    <section id="ritmos" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex justify-center items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Musicalidade
        </ScrollFloat>
      </div>

      {/* Spotify-style Tracklist Container */}
      <div className="max-w-5xl mx-auto bg-[#0a0a0f]/90 rounded-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-4 px-5 sm:px-8 py-4 border-b border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-4">Título & Ritmo</div>
          <div className="hidden sm:block col-span-4">Instrumentos & Descrição</div>
          <div className="hidden md:block col-span-1 text-center">Spotify</div>
          <div className="col-span-6 sm:col-span-3 md:col-span-2 text-right flex items-center justify-end gap-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            <span>Duração</span>
          </div>
        </div>

        {/* 4 Tracks List */}
        <div className="divide-y divide-white/5">
          {featuredRhythms.map((track, idx) => {
            const isCurrent = activeTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackRowClick(track)}
                className={`grid grid-cols-12 gap-4 px-5 sm:px-8 py-4 items-center transition-all duration-200 cursor-pointer group ${isCurrent
                  ? 'bg-white/[0.08] text-white shadow-inner'
                  : 'hover:bg-white/[0.04] text-neutral-300'
                  }`}
              >
                {/* Index / Play Indicator */}
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

                {/* Track Title & Artist */}
                <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#EEDC9A] group-hover:scale-105 transition-transform">
                    {isCurrent ? (
                      <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm sm:text-base font-bold font-syne truncate transition-colors ${isCurrent ? 'text-[#EEDC9A]' : 'text-white group-hover:text-[#EEDC9A]'
                        }`}
                    >
                      {track.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-light truncate">
                      {track.artist || 'Grupo Elite Nagô'}
                    </p>
                  </div>
                </div>

                {/* Instrument / Short Description */}
                <div className="hidden sm:block col-span-4 text-xs text-neutral-400 truncate">
                  <span className="text-neutral-300 font-medium">{track.instrument}</span>
                  <span className="block text-[11px] text-neutral-500 truncate">{track.description}</span>
                </div>

                {/* Spotify Direct Link Button */}
                <div className="hidden md:flex col-span-1 items-center justify-center">
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent('capoeira elite nago ' + track.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border border-[#1DB954]/30 hover:border-[#1DB954] flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer"
                    title={`Ouvir ${track.name} no Spotify`}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.093-.804-.162-.897-.565-.093-.404.161-.805.565-.898 4.564-1.042 8.486-.599 11.634 1.343.353.216.464.674.248 1.027zm1.467-3.261c-.27.439-.848.579-1.287.31-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.028-.135-1.179-.633-.151-.497.135-1.028.633-1.179 4.354-1.321 9.774-.68 13.458 1.584.439.27.579.848.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.593.18-1.224-.16-1.404-.753-.18-.593.16-1.224.753-1.404 4.242-1.288 11.278-1.043 15.727 1.597.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z" />
                    </svg>
                  </a>
                </div>

                {/* Duration & Play Button */}
                <div className="col-span-5 sm:col-span-3 md:col-span-2 flex items-center justify-end gap-2.5 text-right">
                  <button
                    onClick={(e) => handleShare(track, e)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                    title={copiedId === track.id ? 'Copiado!' : 'Compartilhar'}
                  >
                    <Share2 className={`w-3.5 h-3.5 ${copiedId === track.id ? 'text-[#EEDC9A]' : ''}`} />
                  </button>

                  <span className="text-xs font-mono text-neutral-400 min-w-[35px]">
                    {track.duration || '2:45'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayTrack(track);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${isCurrent
                      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                      : 'bg-white/5 hover:bg-white hover:text-black border border-white/15 text-white'
                      }`}
                    aria-label={isCurrent ? 'Pausar' : 'Tocar'}
                  >
                    {isCurrent ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global ElasticSlider Volume Controller (Desktop only) */}
        <div className="hidden sm:flex px-6 sm:px-8 py-3.5 bg-white/[0.02] border-t border-white/10 items-center justify-end gap-4 text-xs">
          <div className="w-full max-w-[240px]">
            <ElasticSlider
              leftIcon={<Volume1 className="w-4 h-4 text-[#EEDC9A]" />}
              rightIcon={<Volume2 className="w-4 h-4 text-[#EEDC9A]" />}
              startingValue={0}
              defaultValue={70}
              value={volume}
              maxValue={100}
              showVolumeText={true}
              onChange={(val) => setVolume(val)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* "Playlist" Action Button below */}
      <div className="mt-10 sm:mt-14 flex justify-center items-center">
        <InteractiveHoverButton
          onClick={handleOpenPlaylist}
          className="px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider"
        >
          Playlist Completa
        </InteractiveHoverButton>
      </div>

      {/* Spotify Modal when track is playing / clicked */}
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
        onSeek={(time) => setPlaybackTime(time)}
      />
    </section>
  );
};

export default SoundboardSection;
