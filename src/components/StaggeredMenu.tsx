import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
  onClick?: () => void;
  isHighlight?: boolean;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#8A733B', '#382F18', '#08080a'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = false,
  className = '',
  logoUrl = '/en.svg',
  accentColor = '#EEDC9A',
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}) => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  // Track window scroll position to enhance mobile glass header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1, visibility: 'hidden' });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1, visibility: 'hidden' });
      }
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    if (panel) gsap.set(panel, { visibility: 'visible' });
    if (preContainer) gsap.set(preContainer, { visibility: 'visible' });
    if (layers.length) gsap.set(layers, { visibility: 'visible' });

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    const offscreen = position === 'left' ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.45, ease: 'power4.out' }, i * 0.06);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.06 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.06 : 0);
    const panelDuration = 0.6;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 0.85, ease: 'power4.out', stagger: { each: 0.07, from: 'start' } },
        itemsStart
      );
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.45, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            stagger: { each: 0.06, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.3,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        if (panel) gsap.set(panel, { visibility: 'hidden' });
        if (preContainer) gsap.set(preContainer, { visibility: 'hidden' });
        if (layers.length) gsap.set(layers, { visibility: 'hidden' });

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 8 });

        const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      },
    });
  }, [position]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
  }, [playOpen, playClose, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
    }
  }, [playClose, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, it: StaggeredMenuItem) => {
    if (it.onClick) {
      e.preventDefault();
      it.onClick();
    } else if (it.link.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(it.link);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  };

  return (
    <div
      className={`sm-scope z-50 ${
        isFixed ? 'fixed inset-0 w-full h-[100dvh] overflow-hidden pointer-events-none' : 'w-full h-full'
      }`}
    >
      <div
        className={
          (className ? className + ' ' : '') +
          'staggered-menu-wrapper relative w-full h-[100dvh] z-50 pointer-events-none'
        }
        style={accentColor ? ({ ['--sm-accent' as any]: accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}
      >
        {/* Animated Pre-layers covering full viewport */}
        <div
          ref={preLayersRef}
          className="sm-prelayers fixed inset-0 w-full h-[100dvh] pointer-events-none z-[5]"
          aria-hidden="true"
        >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#8A733B', '#382F18', '#08080a'];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute inset-0 h-[100dvh] w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        {/* Mobile Header with Glassmorphism Bar, Logo and Toggle Button */}
        <header
          className={`staggered-menu-header fixed top-0 left-0 w-full flex items-center justify-between px-4 sm:px-6 py-3.5 transition-all duration-300 z-30 pointer-events-auto ${
            open
              ? 'bg-[#08080a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl'
              : isScrolled
              ? 'bg-[#08080a]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
              : 'bg-[#08080a]/60 backdrop-blur-lg border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          }`}
          aria-label="Menu de Navegação Mobile"
        >
          <div className="sm-logo flex items-center select-none" aria-label="Logo Elite Nagô">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (open) closeMenu();
              }}
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <img
                src={logoUrl || '/en.svg'}
                alt="Elite Nagô Logo"
                className="sm-logo-img block h-8 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(238,220,154,0.35)] group-hover:scale-105 transition-transform"
                draggable={false}
                width={110}
                height={28}
              />
            </a>
          </div>

          <button
            ref={toggleBtnRef}
            className={`sm-toggle relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border cursor-pointer font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 ${
              open
                ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black border-[#EEDC9A] shadow-[0_0_20px_rgba(238,220,154,0.45)]'
                : 'bg-black/80 text-[#EEDC9A] border-[#EEDC9A]/40 hover:bg-black/95 hover:border-[#EEDC9A]/70 shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
            }`}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            {/* Clear Text Label */}
            <span className="font-bold text-xs uppercase tracking-wider select-none">
              {open ? 'Fechar' : 'Menu'}
            </span>

            {/* Crisp Menu / Close Icon */}
            <span className="shrink-0 flex items-center justify-center">
              {open ? (
                <X className="w-3.5 h-3.5 text-black shrink-0 transition-transform duration-200" />
              ) : (
                <Menu className="w-3.5 h-3.5 text-[#EEDC9A] shrink-0 transition-transform duration-200" />
              )}
            </span>
          </button>
        </header>

        {/* Sliding Full-Screen Menu Panel */}
        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel fixed inset-0 w-full h-[100dvh] min-h-[100dvh] bg-[#08080a] flex flex-col p-[5.5em_2em_2em_2em] overflow-y-auto z-10 backdrop-blur-2xl pointer-events-auto"
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col justify-between gap-6">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-3.5"
              role="list"
              data-numbering={displayItemNumbering ? 'true' : undefined}
            >
              {items && items.length ? (
                items.map((it, idx) => (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                    <a
                      className={`sm-panel-item relative font-black font-syne text-[2rem] xs:text-[2.4rem] cursor-pointer leading-none uppercase transition-colors duration-200 inline-block no-underline pr-[0.4em] ${
                        it.isHighlight
                          ? 'text-[#EEDC9A] hover:text-[#F6E7B8] drop-shadow-[0_0_12px_rgba(238,220,154,0.35)]'
                          : 'text-neutral-100 hover:text-[#EEDC9A]'
                      }`}
                      href={it.link}
                      aria-label={it.ariaLabel || it.label}
                      data-index={idx + 1}
                      onClick={(e) => handleItemClick(e, it)}
                    >
                      <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                        {it.label}
                      </span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative text-neutral-400 font-bold text-2xl uppercase">
                    Sem itens
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems && socialItems.length > 0 && (
              <div className="sm-socials mt-auto pt-6 border-t border-white/10 flex flex-col gap-3" aria-label="Redes Sociais">
                <h3 className="sm-socials-title m-0 text-xs uppercase tracking-widest font-bold text-[#EEDC9A]">
                  Conecte-se
                </h3>
                <ul
                  className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap"
                  role="list"
                >
                  {socialItems.map((s, i) => (
                    <li key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-sm font-medium text-neutral-300 hover:text-[#EEDC9A] no-underline relative inline-block py-1 transition-colors duration-300"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .sm-scope .staggered-menu-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 100vw;
          height: 100dvh;
          min-height: 100vh;
          background: #08080a;
          display: flex;
          flex-direction: column;
          padding: 5.5em 2em 2em 2em;
          overflow-y: auto;
          z-index: 10;
        }
        .sm-scope .sm-prelayers {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 100vw;
          height: 100dvh;
          pointer-events: none;
          z-index: 5;
        }
        .sm-scope .sm-prelayer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          height: 100%;
          width: 100%;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
