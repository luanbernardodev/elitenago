import React, { useState } from 'react';
import {
  Navbar as ResizableNav,
  NavBody,
  NavItems,
  NavbarLogo,
  NavItem,
} from '@/components/ui/resizable-navbar';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { StaggeredMenu, StaggeredMenuItem, StaggeredMenuSocialItem } from './StaggeredMenu';
import { DonationModal } from './DonationModal';

import { cn } from '@/lib/utils';

interface NavbarProps {
  scrollProgress?: number;
  visible?: boolean;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ visible = true, className = '' }) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const desktopNavItems: NavItem[] = [
    { name: 'Sobre', link: '#sobre' },
    {
      name: 'Notícias',
      link: '#noticias',
      submenu: [
        {
          name: 'Página de Notícias',
          description: 'Artigos, comunicados e histórico completo',
          link: '?view=noticias',
        },
      ],
    },
    {
      name: 'Mídias',
      link: '#midias',
      submenu: [
        {
          name: 'Todas as Mídias',
          description: 'Galeria 3D DomeGallery em nova aba',
          link: '?view=midias',
          target: '_blank',
        },
      ],
    },
    {
      name: 'Ritmos',
      link: '#ritmos',
      submenu: [
        {
          name: 'Playlist Completa',
          description: 'Acervo musical, toques e cantigas',
          link: '?view=playlist',
        },
      ],
    },
    { name: 'Apoiadores', link: '#apoiadores' },
    { name: 'Academias', link: '#academias' },
  ];

  const mobileMenuItems: StaggeredMenuItem[] = [
    { label: 'Sobre', link: '#sobre', ariaLabel: 'Sobre o Grupo Elite Nagô' },
    { label: 'Notícias', link: '#noticias', ariaLabel: 'Notícias e Eventos' },
    {
      label: 'Todas as Notícias',
      link: '?view=noticias',
      ariaLabel: 'Página Completa de Notícias',
      onClick: () => {
        window.history.pushState({}, '', '?view=noticias');
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    { label: 'Mídias', link: '#midias', ariaLabel: 'Galeria de Mídias' },
    {
      label: 'Todas as Mídias (3D)',
      link: '?view=midias',
      ariaLabel: 'Galeria 3D Completa de Mídias em Nova Aba',
      onClick: () => {
        window.open('?view=midias', '_blank');
      },
    },
    { label: 'Ritmos', link: '#ritmos', ariaLabel: 'Toques e Ritmos do Berimbau' },
    {
      label: 'Playlist Completa',
      link: '?view=playlist',
      ariaLabel: 'Acervo Musical e Playlist',
      onClick: () => {
        window.history.pushState({}, '', '?view=playlist');
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    { label: 'Apoiadores', link: '#apoiadores', ariaLabel: 'Apoiadores do Grupo Elite Nagô' },
    { label: 'Academias', link: '#academias', ariaLabel: 'Onde Treinar Capoeira' },
    {
      label: 'Apoie o Grupo',
      link: '#ajude',
      ariaLabel: 'Apoiar e Fazer uma Doação',
      isHighlight: true,
      onClick: () => setIsDonationModalOpen(true),
    },
    {
      label: 'Contato',
      link: '#contato',
      ariaLabel: 'Fale Conosco e Inscrição',
      onClick: () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view')) {
          window.history.pushState({}, '', '/#contato');
          window.dispatchEvent(new PopStateEvent('popstate'));
          setTimeout(() => {
            const el = document.getElementById('contato');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        } else {
          const el = document.getElementById('contato');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      },
    },
  ];

  const mobileSocialItems: StaggeredMenuSocialItem[] = [
    { label: 'Instagram', link: 'https://instagram.com' },
    { label: 'WhatsApp', link: 'https://wa.me/5511999999999' },
    { label: 'YouTube', link: 'https://youtube.com' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <ResizableNav
        className={cn(
          'transition-all duration-700 ease-out',
          visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-6 pointer-events-none',
          className
        )}
      >
        <NavBody>
          <NavbarLogo />
          <NavItems items={desktopNavItems} />

          {/* Action Buttons: Apoie & Contato */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <InteractiveHoverButton
              onClick={() => setIsDonationModalOpen(true)}
              className="px-4 sm:px-5 py-2 text-xs min-w-[85px] h-[34px]"
              aria-label="Apoiar o Grupo"
            >
              Apoie
            </InteractiveHoverButton>

            <InteractiveHoverButton
              onClick={() => {
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
              }}
              className="px-4 sm:px-5 py-2 text-xs min-w-[85px] h-[34px]"
              aria-label="Fale Conosco"
            >
              Contato
            </InteractiveHoverButton>
          </div>
        </NavBody>
      </ResizableNav>

      {/* Mobile Only Navigation: StaggeredMenu */}
      <div
        className={cn(
          'block md:hidden transition-opacity duration-700 ease-out',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <StaggeredMenu
          position="right"
          items={mobileMenuItems}
          socialItems={mobileSocialItems}
          displaySocials={true}
          displayItemNumbering={false}
          colors={['#8A733B', '#382F18', '#08080a']}
          logoUrl="/en.svg"
          accentColor="#EEDC9A"
          isFixed={true}
        />
      </div>

      {/* Donation Modal Dialog */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
