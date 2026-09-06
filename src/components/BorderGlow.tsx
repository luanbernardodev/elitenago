import React, { useRef, useState, useEffect, type ReactNode } from 'react';

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    })
    .join(', ');
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInCubic(x: number) {
  return x * x * x;
}

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#08080a',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#f59e0b', '#d97706', '#fbbf24'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);

  const getCenter = (rect: DOMRect) => [rect.width / 2, rect.height / 2];

  const getEdgeProximity = (rect: DOMRect, x: number, y: number) => {
    const [cx, cy] = getCenter(rect);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  };

  const getCursorAngle = (rect: DOMRect, x: number, y: number) => {
    const [cx, cy] = getCenter(rect);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  const handlePointerEnter = () => {
    if (cardRef.current) {
      cachedRectRef.current = cardRef.current.getBoundingClientRect();
    }
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    cachedRectRef.current = null;
    if (cardRef.current) {
      cardRef.current.style.setProperty('--border-opacity', '0');
      cardRef.current.style.setProperty('--glow-opacity', '0');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rafIdRef.current !== null) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const card = cardRef.current;
      if (!card) return;

      const rect = cachedRectRef.current || card.getBoundingClientRect();
      cachedRectRef.current = rect;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const prox = getEdgeProximity(rect, x, y);
      const angle = getCursorAngle(rect, x, y);

      const colorSensitivity = edgeSensitivity + 20;
      const borderOpacity = Math.max(0, (prox * 100 - colorSensitivity) / (100 - colorSensitivity));
      const glowOpacity = Math.max(0, (prox * 100 - edgeSensitivity) / (100 - edgeSensitivity));

      card.style.setProperty('--cursor-angle', `${angle.toFixed(2)}deg`);
      card.style.setProperty('--border-opacity', `${borderOpacity}`);
      card.style.setProperty('--glow-opacity', `${glowOpacity}`);
    });
  };

  useEffect(() => {
    if (!animated) return;
    const card = cardRef.current;
    if (!card) return;

    const angleStart = 110;
    const angleEnd = 465;

    animateValue({
      duration: 500,
      onUpdate: (v) => card.style.setProperty('--border-opacity', `${v / 100}`),
    });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => {
        const ang = (angleEnd - angleStart) * (v / 100) + angleStart;
        card.style.setProperty('--cursor-angle', `${ang.toFixed(2)}deg`);
      },
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => {
        const ang = (angleEnd - angleStart) * (v / 100) + angleStart;
        card.style.setProperty('--cursor-angle', `${ang.toFixed(2)}deg`);
      },
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => card.style.setProperty('--border-opacity', `${v / 100}`),
    });
  }, [animated]);

  const meshGradients = buildMeshGradients(colors);
  const borderBg = meshGradients.map((g) => `${g} border-box`);
  const fillBg = meshGradients.map((g) => `${g} padding-box`);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative isolate border border-white/10 ${className}`}
      style={
        {
          background: backgroundColor,
          borderRadius: `${borderRadius}px`,
          transform: 'translate3d(0, 0, 0.01px)',
          boxShadow:
            'rgba(0,0,0,0.4) 0 4px 12px, rgba(0,0,0,0.6) 0 16px 32px, rgba(245,158,11,0.05) 0 0 20px',
          '--cursor-angle': '45deg',
          '--border-opacity': '0',
          '--glow-opacity': '0',
        } as React.CSSProperties
      }
    >
      {/* mesh gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1] pointer-events-none transition-opacity duration-300"
        style={{
          border: '1px solid transparent',
          background: [
            `linear-gradient(${backgroundColor} 0 100%) padding-box`,
            'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
            ...borderBg,
          ].join(', '),
          opacity: isHovered ? 'var(--border-opacity, 0)' : 0,
          maskImage: `conic-gradient(from var(--cursor-angle, 45deg) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from var(--cursor-angle, 45deg) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
        }}
      />

      {/* mesh gradient fill near edges */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1] pointer-events-none transition-opacity duration-300"
        style={
          {
            border: '1px solid transparent',
            background: fillBg.join(', '),
            maskImage: [
              'linear-gradient(to bottom, black, black)',
              'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
              `conic-gradient(from var(--cursor-angle, 45deg) at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(', '),
            WebkitMaskImage: [
              'linear-gradient(to bottom, black, black)',
              'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
              `conic-gradient(from var(--cursor-angle, 45deg) at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(', '),
            maskComposite: 'subtract, add',
            WebkitMaskComposite: 'source-out, source-over',
            opacity: isHovered ? `calc(var(--border-opacity, 0) * ${fillOpacity})` : 0,
            mixBlendMode: 'soft-light',
          } as React.CSSProperties
        }
      />

      {/* outer glow */}
      <span
        className="absolute pointer-events-none z-[1] rounded-[inherit] transition-opacity duration-300"
        style={
          {
            inset: `${-glowRadius}px`,
            maskImage: `conic-gradient(from var(--cursor-angle, 45deg) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            WebkitMaskImage: `conic-gradient(from var(--cursor-angle, 45deg) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            opacity: isHovered ? 'var(--glow-opacity, 0)' : 0,
            mixBlendMode: 'plus-lighter',
          } as React.CSSProperties
        }
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow: buildBoxShadow(glowColor, glowIntensity),
          }}
        />
      </span>

      <div className="flex flex-col relative z-[1] w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
