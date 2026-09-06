import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Spinner } from './ui/spinner';

interface ScrollyCanvasProps {
  onLoadComplete?: () => void;
  onProgress?: (progress: number) => void;
  onFrameChange?: (frameIndex: number, scrollFraction: number) => void;
}

const TOTAL_FRAMES = 240;
const ZOOM_FACTOR = 1.35;

export const ScrollyCanvas: React.FC<ScrollyCanvasProps> = ({
  onLoadComplete,
  onProgress,
  onFrameChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);
  const onFrameChangeRef = useRef(onFrameChange);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Preload Images with Progressive Priority Loading
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    const checkComplete = () => {
      loadedCount++;
      const percent = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
      if (onProgress) onProgress(percent);

      if (loadedCount === 1) {
        drawFrame(0);
      }

      // Unlock UI as soon as initial 15% (36 frames) are ready so the user is never blocked
      if (loadedCount >= Math.floor(TOTAL_FRAMES * 0.15)) {
        setIsLoaded(true);
        if (onLoadComplete) onLoadComplete();
      }

      if (loadedCount === TOTAL_FRAMES) {
        setIsLoaded(true);
        if (onLoadComplete) onLoadComplete();
      }
    };

    // Load initial priority batch (first 36 frames) immediately
    const priorityCount = 36;
    for (let i = 1; i <= priorityCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = checkComplete;
      img.onerror = checkComplete;
      images[i - 1] = img;
    }

    // Load remaining frames in small background batches to keep main thread idle & network free
    let nextIndex = priorityCount + 1;
    const batchSize = 12;
    const loadNextBatch = () => {
      if (isCancelled || nextIndex > TOTAL_FRAMES) return;

      const limit = Math.min(nextIndex + batchSize, TOTAL_FRAMES + 1);
      for (let i = nextIndex; i < limit; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `/frames/ezgif-frame-${frameNum}.jpg`;
        img.onload = checkComplete;
        img.onerror = checkComplete;
        images[i - 1] = img;
      }
      nextIndex = limit;

      if (nextIndex <= TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => loadNextBatch(), { timeout: 100 });
        } else {
          setTimeout(loadNextBatch, 16);
        }
      }
    };

    loadNextBatch();
    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  // Draw Frame function with Cover Math & ZOOM_FACTOR
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background with solid dark tone
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Aspect ratio math for Object-Fit: Cover
    const imgWidth = img.naturalWidth || img.width || 1920;
    const imgHeight = img.naturalHeight || img.height || 1080;
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = width / height;

    let renderWidth = width;
    let renderHeight = height;

    if (canvasAspect > imgAspect) {
      renderWidth = width;
      renderHeight = width / imgAspect;
    } else {
      renderHeight = height;
      renderWidth = height * imgAspect;
    }

    // Apply ZOOM_FACTOR to slightly crop black bars & letterboxing
    renderWidth *= ZOOM_FACTOR;
    renderHeight *= ZOOM_FACTOR;

    // Centered offsets
    const offsetX = (width - renderWidth) / 2;
    const offsetY = (height - renderHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };

  // Resize Listener
  useEffect(() => {
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        // Redraw current frame
        drawFrame(currentFrameRef.current);
      }, 50);
    };

    // Initial setup
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(0);
    }

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    onFrameChangeRef.current = onFrameChange;
  }, [onFrameChange]);

  // Continuous RAF LERP Engine for ultra-smooth 60/120fps frame transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const fraction = Math.max(0, Math.min(1, scrollY / maxScroll));
      targetFrameRef.current = fraction * (TOTAL_FRAMES - 1);
    };

    let running = true;
    const renderLoop = () => {
      if (!running) return;

      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      // LERP factor (0.12 gives responsive yet buttery smooth feel)
      if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * 0.12;
      } else {
        currentFrameRef.current = target;
      }

      const frameToDraw = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(currentFrameRef.current))
      );

      if (frameToDraw !== lastDrawnFrameRef.current) {
        lastDrawnFrameRef.current = frameToDraw;
        drawFrame(frameToDraw);

        const fraction = currentFrameRef.current / (TOTAL_FRAMES - 1);
        if (onFrameChangeRef.current) {
          onFrameChangeRef.current(frameToDraw, Math.max(0, Math.min(1, fraction)));
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Throttled Interactive Mouse Parallax
  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!canvasRef.current) return;
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xRatio = clientX / innerWidth - 0.5;
        const yRatio = clientY / innerHeight - 0.5;

        gsap.to(canvasRef.current, {
          x: -xRatio * 20,
          y: -yRatio * 20,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
          <div className="relative flex flex-col items-center max-w-md px-6 text-center">
            {/* Logo Brand Title */}
            <h1 className="text-4xl md:text-6xl font-black tracking-widest font-syne text-gold-gradient mb-10">
              ELITE NAGÔ
            </h1>

            {/* Extra Large Spinner in Soft Gold with text */}
            <div className="flex flex-col items-center justify-center gap-5">
              <Spinner
                size="xl"
                color="gold"
              />
              <span className="text-xs md:text-sm font-medium tracking-[0.25em] text-[#eedc9a]/90 font-montserrat uppercase">
                Carregando experiência...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Fullscreen Canvas with scale: 1.05 for Parallax Buffer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0 object-cover transform scale-105"
        style={{ willChange: 'transform' }}
      />
    </>
  );
};
