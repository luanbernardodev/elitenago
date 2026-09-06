// Bulletproof Web Audio Engine for iOS Safari (iPhone), Android, and Desktop
let sharedAudioCtx: AudioContext | null = null;
let isUnlocked = false;

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

// Unlock Web Audio on iOS on first user touch/click
export function unlockAudio() {
  if (isUnlocked) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

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

    // Triangle wave gives a warm, percussive acoustic resonance
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
