import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  ChevronDown,
  MoreVertical,
  Heart,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume1,
  Volume2,
  Disc3,
} from 'lucide-react';
import { RhythmTrack } from '../types';
import { ElasticSlider } from './ElasticSlider';

interface SpotifyPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: RhythmTrack | null;
  isPlaying: boolean;
  onTogglePlay: (track: RhythmTrack) => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  playbackTime: number;
  onSeek?: (time: number) => void;
}

export const SpotifyPlayerModal: React.FC<SpotifyPlayerModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  volume,
  onVolumeChange,
  playbackTime,
  onSeek,
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isDraggingSeek, setIsDraggingSeek] = useState<boolean>(false);
  const [dragSeekTime, setDragSeekTime] = useState<number>(0);

  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !track) return null;

  const parseDurationToSeconds = (dur?: string): number => {
    if (!dur) return 165;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 165;
  };

  const totalDuration = parseDurationToSeconds(track.duration);
  const currentTime = isDraggingSeek ? dragSeekTime : playbackTime;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSeekPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = Math.round(ratio * totalDuration);
    setDragSeekTime(targetSeconds);
    return targetSeconds;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingSeek(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newTime = handleSeekPointer(e);
    if (newTime !== undefined && onSeek) {
      onSeek(newTime);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSeek) {
      const newTime = handleSeekPointer(e);
      if (newTime !== undefined && onSeek) {
        onSeek(newTime);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSeek) {
      const newTime = handleSeekPointer(e);
      if (newTime !== undefined && onSeek) {
        onSeek(newTime);
      }
      setIsDraggingSeek(false);
    }
  };

  const spotifyQueryUrl = `https://open.spotify.com/search/${encodeURIComponent(`capoeira elite nago ${track.name}`)}`;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6 bg-black/90 sm:bg-black/85 backdrop-blur-2xl animate-fadeIn select-none">
      {/* Spotify Player Container: Full screen on mobile with zero scroll */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md overflow-hidden rounded-none sm:rounded-3xl bg-gradient-to-b from-[#141b18] via-[#0d0f10] to-[#070808] border-0 sm:border sm:border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white p-5 sm:p-8 flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono tracking-widest text-neutral-400 uppercase shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Minimizar Player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <span className="font-bold text-neutral-200">Tocando Agora</span>

          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Center Visual (Circular Rotating Artwork / Vinyl Glow) */}
        <div className="my-auto py-4 flex flex-col items-center justify-center shrink-0">
          <div className="relative w-44 h-44 xs:w-52 xs:h-52 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-black border-4 border-white/15 shadow-[0_0_50px_rgba(238,220,154,0.15)] flex items-center justify-center overflow-hidden group">
            {/* Spinning Groove Lines */}
            <div className={`absolute inset-0 rounded-full border border-white/10 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <div className="absolute inset-4 rounded-full border border-white/5" />
              <div className="absolute inset-8 rounded-full border border-white/5" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
            </div>

            {/* Center Berimbau Badge / Disc Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0a0a0d] border-2 border-[#EEDC9A]/50 flex items-center justify-center shadow-inner relative z-10">
              <Disc3 className={`w-9 h-9 sm:w-10 sm:h-10 text-[#EEDC9A] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Track Title & Artist with Like Button */}
        <div className="shrink-0 my-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-black font-syne text-white truncate leading-tight">
                {track.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#EEDC9A] font-medium truncate mt-0.5">
                {track.artist || 'Grupo Elite Nagô'} • <span className="text-neutral-400">{track.instrument}</span>
              </p>
            </div>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label={isLiked ? 'Descurtir' : 'Curtir'}
            >
              <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'text-neutral-400 hover:text-white'}`} />
            </button>
          </div>
        </div>

        {/* Interactive Seek / Scrubbing Bar */}
        <div className="space-y-1 my-2 shrink-0">
          <div
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full py-2 cursor-pointer group flex items-center touch-none select-none"
            title="Arraste para selecionar parte da música"
          >
            {/* Background Track */}
            <div className="relative w-full h-1.5 group-hover:h-2 bg-neutral-800 rounded-full overflow-hidden transition-all duration-150">
              <div
                className="h-full bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] rounded-full shadow-[0_0_8px_rgba(238,220,154,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Draggable Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(238,220,154,0.9)] transition-transform duration-75 pointer-events-none ${
                isDraggingSeek ? 'scale-125' : 'group-hover:scale-110'
              }`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-0.5">
            <span className="text-[#EEDC9A] font-semibold">{formatSeconds(currentTime)}</span>
            <span>{track.duration || '2:45'}</span>
          </div>
        </div>

        {/* Spotify Main Controls Bar */}
        <div className="flex items-center justify-between px-2 my-2 sm:my-3 shrink-0">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
            title="Ordem Aleatória"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Faixa Anterior"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => onTogglePlay(track)}
            className="w-14 h-14 rounded-full bg-white text-neutral-950 hover:bg-[#EEDC9A] flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            onClick={onNextTrack}
            className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Próxima Faixa"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${isRepeat ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
            title="Repetir"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume with ElasticSlider (Desktop/Tablet only) */}
        <div className="hidden sm:block p-3 rounded-2xl bg-white/[0.03] border border-white/10 my-2 shrink-0">
          <ElasticSlider
            leftIcon={<Volume1 className="w-4 h-4 text-[#EEDC9A]" />}
            rightIcon={<Volume2 className="w-4 h-4 text-[#EEDC9A]" />}
            startingValue={0}
            defaultValue={70}
            value={volume}
            maxValue={100}
            showVolumeText={true}
            onChange={onVolumeChange}
            className="w-full"
          />
        </div>

        {/* Prominent / Floating Action Button: "Ouvir no Spotify" */}
        <div className="pt-2 flex justify-center shrink-0">
          <a
            href={spotifyQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs sm:text-sm font-black font-syne uppercase tracking-wider shadow-[0_4px_25px_rgba(29,185,84,0.4)] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.093-.804-.162-.897-.565-.093-.404.161-.805.565-.898 4.564-1.042 8.486-.599 11.634 1.343.353.216.464.674.248 1.027zm1.467-3.261c-.27.439-.848.579-1.287.31-3.219-1.978-8.127-2.55-11.935-1.393-.497.151-1.028-.135-1.179-.633-.151-.497.135-1.028.633-1.179 4.354-1.321 9.774-.68 13.458 1.584.439.27.579.848.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.593.18-1.224-.16-1.404-.753-.18-.593.16-1.224.753-1.404 4.242-1.288 11.278-1.043 15.727 1.597.533.316.708 1.011.392 1.544-.316.533-1.011.708-1.544.392z"/>
            </svg>
            <span>Ouvir no Spotify</span>
          </a>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default SpotifyPlayerModal;
