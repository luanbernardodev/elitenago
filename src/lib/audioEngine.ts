// Bulletproof Audio Engine with Real MP3 Playback and Web Audio Synthesis Fallback
// Full support for iOS Safari, Android, and Modern Desktop Browsers
import { RhythmTrack } from '@/types';

let sharedAudioCtx: AudioContext | null = null;
let isUnlocked = false;

// Global singleton HTMLAudioElement for real MP3 playback
let globalAudioElement: HTMLAudioElement | null = null;
let synthInterval: any = null;
let currentPlayingTrack: RhythmTrack | null = null;
let globalVolume: number = 70;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }

    if (sharedAudioCtx && (sharedAudioCtx.state === 'suspended' || (sharedAudioCtx.state as string) === 'interrupted')) {
      sharedAudioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.warn('getSharedAudioContext error:', e);
  }

  return sharedAudioCtx;
}

// Unlock Web Audio and Media Audio on iOS on first user touch/click
export function unlockAudio() {
  if (isUnlocked) return;
  const ctx = getSharedAudioContext();
  if (ctx) {
    try {
      if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
        ctx.resume().then(() => {
          isUnlocked = true;
        }).catch(() => {});
      }

      // Play 1-frame silent buffer to activate iOS audio hardware
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      isUnlocked = true;
    } catch {}
  }

  // Wake iOS AVAudioSession with lightweight silent data URI
  try {
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.volume = 0.01;
    const playPromise = silentAudio.play();
    if (playPromise) playPromise.catch(() => {});
  } catch {}
}

// Auto-register touch/click listeners to unlock audio immediately on user interaction
if (typeof window !== 'undefined') {
  const events = ['touchstart', 'touchend', 'click', 'keydown', 'pointerdown'];
  const handler = () => {
    unlockAudio();
    events.forEach((ev) => window.removeEventListener(ev, handler));
  };
  events.forEach((ev) => {
    window.addEventListener(ev, handler, { passive: true });
  });
}

// Synthesize a berimbau / capoeira percussion pulse
export function playRhythmPulse(freq: number, volume: number = 70) {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const vol = Math.max(0.05, (volume / 100) * 0.55);

    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.22);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  } catch (err) {
    console.warn('Audio play pulse error:', err);
  }
}

// Stop any currently playing audio (real MP3 or synth loop)
export function stopCurrentTrack() {
  if (globalAudioElement) {
    globalAudioElement.pause();
    globalAudioElement.currentTime = 0;
    globalAudioElement = null;
  }
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  currentPlayingTrack = null;
}

export function pauseCurrentTrack() {
  if (globalAudioElement) {
    globalAudioElement.pause();
  }
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}

export function resumeCurrentTrack() {
  if (globalAudioElement && currentPlayingTrack?.audioSrc) {
    globalAudioElement.play().catch(() => {});
  }
}

export function seekCurrentTrack(seconds: number) {
  if (globalAudioElement) {
    globalAudioElement.currentTime = seconds;
  }
}

export function setGlobalVolume(volume: number) {
  globalVolume = volume;
  if (globalAudioElement) {
    globalAudioElement.volume = Math.max(0, Math.min(1, volume / 100));
  }
}

// Master Player function: Plays real MP3 if audioSrc exists, otherwise synth pulse
export function playTrack(
  track: RhythmTrack,
  volume: number = 70,
  onTimeUpdate?: (seconds: number) => void,
  onEnded?: () => void
) {
  stopCurrentTrack();
  unlockAudio();
  currentPlayingTrack = track;
  globalVolume = volume;

  if (track.audioSrc) {
    const audio = new Audio(track.audioSrc);
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    globalAudioElement = audio;

    audio.addEventListener('timeupdate', () => {
      if (onTimeUpdate && audio) {
        onTimeUpdate(Math.floor(audio.currentTime));
      }
    });

    audio.addEventListener('ended', () => {
      if (onEnded) onEnded();
    });

    audio.play().catch((err) => {
      console.warn('Playback error, falling back to synth pulse:', err);
      fallbackToSynth(track, volume, onTimeUpdate);
    });
  } else {
    fallbackToSynth(track, volume, onTimeUpdate);
  }
}

function fallbackToSynth(
  track: RhythmTrack,
  volume: number,
  onTimeUpdate?: (seconds: number) => void
) {
  if (track.pattern[0] === 1) {
    playRhythmPulse(track.freq, volume);
  }

  let step = 1;
  synthInterval = setInterval(() => {
    const isBeat = track.pattern[step % track.pattern.length] === 1;
    if (isBeat) {
      playRhythmPulse(track.freq, globalVolume);
    }
    step++;
  }, 250);

  let currentSec = 0;
  const timer = setInterval(() => {
    if (currentPlayingTrack?.id !== track.id) {
      clearInterval(timer);
      return;
    }
    currentSec++;
    if (onTimeUpdate) onTimeUpdate(currentSec);
  }, 1000);
}
