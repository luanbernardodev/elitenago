"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

interface NavbarContextType {
  isScrolled: boolean;
}

const NavbarContext = createContext<NavbarContextType>({ isScrolled: false });

export const Navbar = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <NavbarContext.Provider value={{ isScrolled }}>
      <header className={`fixed top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 transition-all duration-300 pointer-events-none ${className}`}>
        {children}
      </header>
    </NavbarContext.Provider>
  );
};

export const NavBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { isScrolled } = useContext(NavbarContext);

  return (
    <motion.div
      layout
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
      }}
      className={`pointer-events-auto hidden md:flex items-center justify-between gap-3 lg:gap-5 px-4 lg:px-6 py-2 rounded-full transition-all duration-300 ${
        isScrolled
          ? 'w-full max-w-5xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.06)]'
          : 'w-full max-w-7xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

import { ChevronDown, ArrowRight } from 'lucide-react';

export interface SubMenuItem {
  name: string;
  description?: string;
  link: string;
  target?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface NavItem {
  name: string;
  link: string;
  target?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isHighlight?: boolean;
  submenu?: SubMenuItem[];
}

export const NavItems = ({ items }: { items: NavItem[] }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleItemClick = (e: React.MouseEvent, link: string, onClick?: () => void, target?: string) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      setHoveredIdx(null);
      return;
    }

    if (target === '_blank') {
      e.preventDefault();
      window.open(link, '_blank');
      setHoveredIdx(null);
      return;
    }

    if (link.startsWith('?view=')) {
      e.preventDefault();
      window.history.pushState({}, '', link);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setHoveredIdx(null);
      return;
    }

    if (link.startsWith('#')) {
      e.preventDefault();
      const params = new URLSearchParams(window.location.search);
      if (params.get('view')) {
        window.history.pushState({}, '', '/' + link);
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: link, offsetY: 40 },
            ease: 'power3.inOut',
          });
        }, 150);
      } else {
        gsap.to(window, {
          duration: 1.2,
          scrollTo: { y: link, offsetY: 40 },
          ease: 'power3.inOut',
        });
      }
      setHoveredIdx(null);
    }
  };

  return (
    <nav className="flex items-center gap-0.5 lg:gap-1 flex-shrink">
      {items.map((item, idx) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={item.name}
            className="relative group py-1"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <a
              href={item.link}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              onClick={(e) => handleItemClick(e, item.link, item.onClick, item.target)}
              className={`relative px-2.5 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-colors rounded-full flex items-center gap-1.5 shrink-0 select-none ${
                item.isHighlight
                  ? 'text-[#EEDC9A] hover:text-[#F6E7B8] bg-white/5 border border-white/20'
                  : isHovered
                  ? 'text-[#EEDC9A]'
                  : 'text-neutral-200 hover:text-[#EEDC9A]'
              }`}
            >
              {isHovered && (
                <motion.span
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="absolute inset-0 bg-white/10 rounded-full border border-white/20 -z-10"
                />
              )}
              {item.icon}
              <span>{item.name}</span>
              {hasSubmenu && (
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                    isHovered ? 'rotate-180 text-[#EEDC9A]' : ''
                  }`}
                />
              )}
            </a>

            {/* Dropdown Submenu */}
            {hasSubmenu && isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 w-64 pointer-events-auto"
              >
                <div className="p-2 rounded-2xl bg-[#0b0c10]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(238,220,154,0.12)] text-left flex flex-col gap-1">
                  {item.submenu!.map((sub) => (
                    <a
                      key={sub.name}
                      href={sub.link}
                      target={sub.target}
                      rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                      onClick={(e) => handleItemClick(e, sub.link, sub.onClick, sub.target)}
                      className="group/sub flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer select-none"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-neutral-200 group-hover/sub:text-[#EEDC9A] transition-colors flex items-center gap-1.5 font-syne">
                          {sub.icon}
                          <span>{sub.name}</span>
                        </div>
                        {sub.description && (
                          <p className="text-[10px] text-neutral-400 font-light mt-0.5 leading-tight group-hover/sub:text-neutral-300">
                            {sub.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover/sub:text-[#EEDC9A] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export const NavbarLogo = ({ onClick }: { onClick?: () => void }) => {
  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: 0 },
        ease: 'power3.inOut',
      });
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center shrink-0 group text-left focus:outline-none cursor-pointer pr-1"
      aria-label="Ir para o topo"
    >
      <img
        src="/en.svg"
        alt="Elite Nagô Logo"
        className="h-8 lg:h-9 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-[0_0_10px_rgba(238,220,154,0.3)]"
      />
    </button>
  );
};

export const NavbarButton = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view')) {
        window.history.pushState({}, '', '/#contato');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
          const el = document.getElementById('contato');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 250);
      } else {
        const el = document.getElementById('contato');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: '#contato', offsetY: 30 },
            ease: 'power3.inOut',
          });
        }
      }
    }
  };

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleClick}
        className={`px-3.5 py-1.5 rounded-full border border-white/20 text-neutral-200 hover:text-white text-[11px] lg:text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer shrink-0 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2 text-center font-syne text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 border border-white/95 bg-white text-neutral-950 shadow-[0_2px_12px_rgba(255,255,255,0.12)] hover:border-[#EEDC9A] hover:shadow-[0_0_22px_rgba(238,220,154,0.4)] cursor-pointer shrink-0 ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
      <span className="relative z-10 font-extrabold text-neutral-950 group-hover:text-black transition-colors duration-200">
        {children}
      </span>
    </button>
  );
};

export const MobileNav = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { isScrolled } = useContext(NavbarContext);

  return (
    <motion.div
      layout
      className={`pointer-events-auto flex md:hidden flex-col w-full max-w-lg rounded-2xl transition-all duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl'
          : 'bg-black/70 backdrop-blur-md border border-white/10'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between p-4">{children}</div>;
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-[#EEDC9A] hover:text-white focus:outline-none"
      aria-label={isOpen ? 'Fechar Menu' : 'Abrir Menu'}
    >
      {isOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl font-bold">☰</span>}
    </button>
  );
};

export const MobileNavMenu = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) => {
  return (
    isOpen && (
      <div className="flex flex-col gap-3 p-4 border-t border-white/10 bg-black/95 rounded-b-2xl">
        {children}
      </div>
    )
  );
};

export default Navbar;
