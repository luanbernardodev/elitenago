import React from 'react';

export interface LogoItem {
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
  className?: string;
}

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number; // duration in seconds for one full loop cycle
  direction?: 'left' | 'right' | 'up' | 'down';
  logoHeight?: number | string;
  gap?: number | string;
  pauseOnHover?: boolean;
  scaleOnHover?: boolean;
  grayscale?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  className?: string;
}

export const LogoLoop: React.FC<LogoLoopProps> = ({
  logos = [],
  speed = 30,
  direction = 'left',
  logoHeight = 55,
  gap = 64,
  pauseOnHover = true,
  scaleOnHover = true,
  grayscale = true,
  fadeOut = true,
  fadeOutColor = '#000000',
  ariaLabel = 'Parceiros do Elite Nagô',
  className = '',
}) => {
  if (!logos || logos.length === 0) return null;

  const isVertical = direction === 'up' || direction === 'down';
  const isReverse = direction === 'right' || direction === 'down';

  const gapStyle = typeof gap === 'number' ? `${gap}px` : gap;
  const heightStyle = typeof logoHeight === 'number' ? `${logoHeight}px` : logoHeight;

  // Duplicate items 4 times to ensure seamless infinite looping on any screen size
  const repeatedLogos = [...logos, ...logos, ...logos, ...logos];

  const renderLogo = (item: LogoItem, idx: number) => {
    const logoElement = (
      <div
        className={`flex items-center justify-center transition-all duration-300 ease-out ${
          grayscale
            ? 'grayscale opacity-60 contrast-110 hover:grayscale-0 hover:opacity-100 hover:contrast-100'
            : 'opacity-90 hover:opacity-100'
        } ${
          scaleOnHover ? 'hover:scale-110 hover:drop-shadow-[0_4px_16px_rgba(238,220,154,0.35)]' : ''
        } ${item.className || ''}`}
        style={{ height: heightStyle }}
      >
        {item.node ? (
          <div className="flex items-center justify-center text-3xl md:text-4xl text-neutral-400 hover:text-[#EEDC9A] transition-colors duration-300">
            {item.node}
          </div>
        ) : (
          <img
            src={item.src}
            alt={item.alt || item.title || 'Parceiro'}
            className="max-h-full max-w-[170px] sm:max-w-[210px] object-contain select-none pointer-events-none transition-all duration-300"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    );

    if (item.href && item.href !== '#') {
      return (
        <a
          key={`logo-item-${idx}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.title || item.alt}
          className="group inline-flex items-center justify-center shrink-0 cursor-pointer px-3 py-2 transition-transform duration-300"
        >
          {logoElement}
        </a>
      );
    }

    return (
      <div
        key={`logo-item-${idx}`}
        className="group inline-flex items-center justify-center shrink-0 px-3 py-2 transition-transform duration-300"
      >
        {logoElement}
      </div>
    );
  };

  return (
    <div
      className={`logo-loop-container relative w-full overflow-hidden select-none py-2 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Left / Right Fade gradients */}
      {fadeOut && (
        <>
          <div
            className={`pointer-events-none absolute z-10 ${
              isVertical
                ? 'top-0 left-0 right-0 h-12 bg-gradient-to-b'
                : 'top-0 bottom-0 left-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r'
            }`}
            style={{
              backgroundImage: isVertical
                ? `linear-gradient(to bottom, ${fadeOutColor} 0%, transparent 100%)`
                : `linear-gradient(to right, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
          <div
            className={`pointer-events-none absolute z-10 ${
              isVertical
                ? 'bottom-0 left-0 right-0 h-12 bg-gradient-to-t'
                : 'top-0 bottom-0 right-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l'
            }`}
            style={{
              backgroundImage: isVertical
                ? `linear-gradient(to top, ${fadeOutColor} 0%, transparent 100%)`
                : `linear-gradient(to left, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
        </>
      )}

      {/* Marquee Track Container */}
      <div
        className={`logo-loop-track flex items-center ${
          isVertical ? 'flex-col' : 'flex-row'
        } w-max`}
        style={{
          gap: gapStyle,
          animationDuration: `${speed}s`,
          animationDirection: isReverse ? 'reverse' : 'normal',
        }}
      >
        {repeatedLogos.map((item, idx) => renderLogo(item, idx))}
      </div>

      <style>{`
        @keyframes logo-loop-horizontal {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .logo-loop-track {
          animation-name: logo-loop-horizontal;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        ${
          pauseOnHover
            ? `
        .logo-loop-container:hover .logo-loop-track {
          animation-play-state: paused !important;
        }
        `
            : ''
        }
      `}</style>
    </div>
  );
};

export default LogoLoop;
