import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { gsap } from 'gsap';

export interface AccordionGalleryColor {
  name: string;
  hex: string;
}

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
  corda?: string;
  grau?: string;
  description?: string;
  colors?: AccordionGalleryColor[];
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

export const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  accentColor = '#f59e0b',
  textColor = '#ffffff',
  height = 480,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 1.8,
  ease = 'power2.out',
  parallax = 0.4,
  tilt = 5,
  stagger = 0.04,
  trigger = 'hover',
  showLabels = true,
  grayscale = false,
  className = ''
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const detailsRefs = useRef<(HTMLElement | null)[]>([]);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset active index if items change
  useEffect(() => {
    setActive(Math.min(Math.max(defaultIndex, 0), items.length - 1));
  }, [items, defaultIndex]);

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const vertical = orientation === 'vertical' || isMobile;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      const dur = animate && !prefersReduced ? duration : 0;

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];
        const details = detailsRefs.current[i];

        const rot = isMobile ? 0 : isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        gsap.to(panel, {
          flexGrow: isActive ? grow : 1,
          ...rotProp,
          duration: dur,
          ease,
          overwrite: 'auto'
        });

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = isMobile ? 0 : drift * parallax * mediaSize * 0.05;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          gsap.to(media, {
            xPercent: -50,
            yPercent: -50,
            x: vertical ? 0 : isActive ? 0 : shift,
            y: vertical ? (isActive ? 0 : shift) : 0,
            '--ag-gray': gray,
            '--ag-dim': isActive ? 0 : 0.4,
            duration: dur,
            ease,
            overwrite: 'auto'
          });
        }

        if (showLabels && bar && text) {
          if (isActive) {
            gsap.to([bar, text], {
              opacity: 1,
              x: 0,
              duration: dur * 0.8,
              ease,
              stagger: prefersReduced ? 0 : stagger,
              overwrite: 'auto'
            });
          } else {
            gsap.to([bar, text], {
              opacity: isMobile ? 0.7 : 0,
              x: isMobile ? 0 : -10,
              duration: dur * 0.5,
              ease,
              overwrite: 'auto'
            });
          }
        }

        if (details) {
          if (isActive) {
            gsap.to(details, {
              opacity: 1,
              y: 0,
              duration: dur * 0.8,
              ease,
              delay: 0.1,
              overwrite: 'auto'
            });
          } else {
            gsap.to(details, {
              opacity: 0,
              y: 8,
              duration: dur * 0.4,
              ease,
              overwrite: 'auto'
            });
          }
        }
      });
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      isMobile,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(160, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.25);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  const handleEnter = (i: number) => {
    if (trigger === 'hover' && !isMobile) setActive(i);
  };

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  // Mobile adaptive height: gives comfortable space for each item in vertical column
  const calculatedHeight = isMobile
    ? Math.max(520, count * 64 + 140)
    : height;

  return (
    <div
      ref={rootRef}
      className={`flex ${
        isMobile ? 'flex-col' : orientation === 'vertical' ? 'flex-col' : 'flex-row'
      } w-full max-w-full [perspective:1400px] max-[640px]:[perspective:none] ${className}`}
      style={{
        gap: `${gap}px`,
        height: `${calculatedHeight}px`,
      }}
      role="list"
      aria-label="Galeria de graduações e cordas"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? 'a' : 'div') as 'a';
        return (
          <Tag
            key={i}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el;
            }}
            className="group relative block min-w-0 min-h-0 flex-[1_1_0] cursor-pointer overflow-hidden bg-black border-0 no-underline outline-none [transform-style:preserve-3d] [transform-origin:center] [box-shadow:0_15px_35px_-15px_rgba(0,0,0,0.95)] max-[640px]:min-h-[58px] max-[640px]:!transform-none select-none"
            style={
              {
                borderRadius: `${radius}px`,
                '--ag-accent': accentColor,
                willChange: 'flex-grow, transform',
              } as CSSProperties
            }
            href={item.link || undefined}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onTouchStart={() => setActive(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            {/* Pure Solid Black Background & Media Frame without gradients or borders */}
            <span className="absolute inset-0 overflow-hidden [border-radius:inherit] bg-black">
              <span
                ref={(el: HTMLElement | null) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute top-1/2 left-1/2 flex items-center justify-center p-3 sm:p-4 [filter:grayscale(var(--ag-gray,0))]"
                style={{
                  width: vertical ? '100%' : 'var(--ag-media-size, 320px)',
                  height: vertical ? 'var(--ag-media-size, 320px)' : '100%',
                  willChange: 'transform, filter',
                }}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.label || 'Corda de Capoeira'}
                  draggable={false}
                  className="block h-full max-h-[85%] w-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] select-none [-webkit-user-drag:none] transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              {/* Pure dark overlay */}
              <span
                className="pointer-events-none absolute inset-0 bg-black/40"
                aria-hidden="true"
              />
            </span>

            {/* Label & Details Container */}
            {showLabels && (
              <div
                className="pointer-events-none absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-[2] flex flex-col gap-2"
                aria-hidden="true"
              >
                {/* Header Badge */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span
                    ref={(el: HTMLElement | null) => {
                      barRefs.current[i] = el;
                    }}
                    className="h-[18px] sm:h-[22px] w-[3px] flex-none rounded-[3px] opacity-0"
                    style={{
                      background: accentColor,
                      boxShadow: `0 0 14px color-mix(in srgb, ${accentColor} 80%, transparent)`,
                    }}
                  />
                  <div
                    ref={(el: HTMLElement | null) => {
                      textRefs.current[i] = el;
                    }}
                    className="flex flex-col min-w-0 opacity-0"
                  >
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap text-xs sm:text-base font-bold font-syne uppercase tracking-wider [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]"
                      style={{ color: textColor }}
                    >
                      {item.grau ? `Grau: ${item.grau}` : item.label}
                    </span>
                  </div>
                </div>

                {/* Additional Description & Color Swatches for Active Card */}
                {isActive && (item.description || item.colors) && (
                  <div
                    ref={(el: HTMLElement | null) => {
                      detailsRefs.current[i] = el;
                    }}
                    className="space-y-1.5 sm:space-y-2 pt-1 opacity-0 max-w-md"
                  >
                    {item.colors && item.colors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                        {item.colors.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/90 border-0 text-[9px] sm:text-[10px] font-semibold text-neutral-200 shadow-sm"
                          >
                            <span
                              className="w-2 h-2 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span>{color.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.description && (
                      <p className="text-[10px] sm:text-xs text-neutral-300 font-light leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
