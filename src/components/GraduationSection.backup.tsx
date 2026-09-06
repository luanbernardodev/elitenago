import React, { useState } from 'react';
import { GraduationSystem } from '../types';
import { ScrollFloat } from './ScrollFloat';
import { AccordionGallery } from './AccordionGallery';

const GRADUATION_SYSTEMS: GraduationSystem[] = [
  {
    id: 'mirim',
    title: 'Mirim',
    subtitle: 'Formação Infantil e Desenvolvimento Lúdico-Motor (5 a 10 Anos)',
    ageRange: '5 a 10 Anos',
    cards: [
      {
        id: 'mirim-1',
        title: '1ª Graduação Mirim',
        corda: 'Cinza com Ponta Verde',
        description: 'Iniciação aos passos básicos da ginga, noções de ritmo, esquivas simples e coordenação motora.',
        image: '/graduacaoes/mirim/1_cinza_verde.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' }
        ]
      },
      {
        id: 'mirim-2',
        title: '2ª Graduação Mirim',
        corda: 'Cinza com Ponta Amarela',
        description: 'Desenvolvimento das movimentações de esquiva lateral, chutes frontais e disciplina na roda.',
        image: '/graduacaoes/mirim/2_cinza_amarelo.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'mirim-3',
        title: '3ª Graduação Mirim',
        corda: 'Cinza com c Azul',
        description: 'Consolidação das cantigas tradicionais, palmas rítmicas e maior fluidez na ginga.',
        image: '/graduacaoes/mirim/3_cinza_azul.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'mirim-4',
        title: '4ª Graduação Mirim',
        corda: 'Cinza com Pontas Verde e Amarela',
        description: 'Domínio da ginga contínua, jogos em dupla com interação e introdução às esquivas combinadas.',
        image: '/graduacaoes/mirim/4_cinza_verde_amarelo.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'mirim-5',
        title: '5ª Graduação Mirim',
        corda: 'Cinza com Pontas Verde e Azul',
        description: 'Introdução aos toques fundamentais de Pandeiro e Atabaque e aprimoramento da agilidade.',
        image: '/graduacaoes/mirim/5_cinza_verde_azul.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'mirim-6',
        title: '6ª Graduação Mirim',
        corda: 'Cinza com Pontas Amarela e Azul',
        description: 'Prontidão técnica e maturidade para a transição direta para o sistema de graduação Juvenil.',
        image: '/graduacaoes/mirim/6_cinza_amarelo_azul.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      }
    ]
  },
  {
    id: 'juvenil',
    title: 'Juvenil',
    subtitle: 'Aprimoramento Técnico, Agilidade e Valores Históricos (11 a 17 Anos)',
    ageRange: '11 a 17 Anos',
    cards: [
      {
        id: 'juvenil-1',
        title: '1ª Corda Juvenil',
        corda: 'Cinza e Verde',
        description: 'Consolidação dos fundamentos da Capoeira Regional e Angola com foco em postura e ginga firme.',
        image: '/graduacaoes/juvenil/1_cinza_verde.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' }
        ]
      },
      {
        id: 'juvenil-2',
        title: '2ª Corda Juvenil',
        corda: 'Cinza e Amarelo',
        description: 'Exploração de movimentos floreados, acrobacias básicas e raciocínio rápido no jogo.',
        image: '/graduacaoes/juvenil/2_cinza_amarelo.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'juvenil-3',
        title: '3ª Corda Juvenil',
        corda: 'Cinza e Azul',
        description: 'Desenvolvimento de liderança jovem, canto em roda e auxílio na condução dos pequenos mirins.',
        image: '/graduacaoes/juvenil/3_cinza_azul.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'juvenil-4',
        title: '4ª Corda Juvenil',
        corda: 'Cinza, Verde e Amarelo',
        description: 'Aprofundamento na musicalidade do Berimbau, afinação e aprendizado de Ladainhas.',
        image: '/graduacaoes/juvenil/4_cinza_verde_amarelo.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'juvenil-5',
        title: '5ª Corda Juvenil',
        corda: 'Cinza, Verde e Azul',
        description: 'Domínio das rasteiras, tesouras, contra-ataques eficientes e estratégia de roda.',
        image: '/graduacaoes/juvenil/5_cinza_verde_azul.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'juvenil-6',
        title: '6ª Corda Juvenil',
        corda: 'Cinza, Azul e Amarelo',
        description: 'Preparação física avançada, resistência de roda e consolidação filosófica da capoeira.',
        image: '/graduacaoes/juvenil/6_cinza_azul_amarelo.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Azul', hex: '#2563eb' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'juvenil-7',
        title: '7ª Corda Juvenil (Adaptação)',
        corda: 'Cinza, Preto e Amarelo',
        description: 'Cordão de transição direta para a categoria Adulta/Graduados, com foco na maturidade técnica.',
        image: '/graduacaoes/juvenil/7_cinza_preto_amarelo_adaptacao.png',
        colors: [
          { name: 'Cinza', hex: '#9ca3af' },
          { name: 'Preto', hex: '#171717' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      }
    ]
  },
  {
    id: 'adulto',
    title: 'Adulto',
    subtitle: 'Mestria, Ensino, Filosofia e Liderança do Grupo Elite Nagô (Acima de 18 Anos)',
    ageRange: 'Acima de 18 Anos',
    cards: [
      {
        id: 'adulto-0',
        title: 'Corda de Adaptação',
        corda: 'Amarelo e Preto',
        grau: 'Adaptação',
        description: 'Fase de transição e adaptação técnica para novos praticantes no sistema adulto.',
        image: '/graduacaoes/adulto/00amarelo_preto_adaptacao.png',
        colors: [
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Preto', hex: '#171717' }
        ]
      },
      {
        id: 'adulto-1',
        title: '1ª Corda Adulto',
        corda: 'Verde',
        grau: 'Aluno',
        description: 'Iniciação do capoeirista adulto, foco nos fundamentos da ginga, esquivas e movimentação básica.',
        image: '/graduacaoes/adulto/1_verde_aluno.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' }
        ]
      },
      {
        id: 'adulto-2',
        title: '2ª Corda Adulto',
        corda: 'Amarelo',
        grau: 'Aluno',
        description: 'Evolução técnica, aprimoramento do jogo de pernas, chutes objetivos e musicalidade inicial.',
        image: '/graduacaoes/adulto/2_amarelo_aluno.png',
        colors: [
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'adulto-3',
        title: '3ª Corda Adulto',
        corda: 'Azul',
        grau: 'Aluno',
        description: 'Consolidação do ritmo e fluidez, domínio das cantigas de roda e maior dinamismo nos treinos.',
        image: '/graduacaoes/adulto/3_azul_aluno.png',
        colors: [
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'adulto-4',
        title: '4ª Corda Adulto',
        corda: 'Verde e Amarelo',
        grau: 'Aluno Avançado',
        description: 'Fase de aperfeiçoamento nos ritmos do berimbau, ladainhas e combinações de ataque e defesa.',
        image: '/graduacaoes/adulto/4_verde_amarelo_aluno.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Amarelo', hex: '#eab308' }
        ]
      },
      {
        id: 'adulto-5',
        title: '5ª Corda Adulto',
        corda: 'Verde e Azul',
        grau: 'Aluno Graduando',
        description: 'Maturidade como praticante avançado, prontidão técnica e apoio na condução dos treinos.',
        image: '/graduacaoes/adulto/5_verde_azul_aluno.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'adulto-6',
        title: '6ª Corda Adulto',
        corda: 'Amarelo e Azul',
        grau: 'Estagiário',
        description: 'Primeiro degrau no plano docente: estágio pedagógico, auxílio aos professores e organização de rodas.',
        image: '/graduacaoes/adulto/6_amarelo_azul_estagiario.png',
        colors: [
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'adulto-7',
        title: '7ª Corda Adulto',
        corda: 'Verde, Amarelo e Azul',
        grau: 'Graduado',
        description: 'Formatura como capoeirista pleno, domínio de instrumentos, cantos tradicionais e rituais da roda.',
        image: '/graduacaoes/adulto/7_verde_amarelo_azul_graduado.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Azul', hex: '#2563eb' }
        ]
      },
      {
        id: 'adulto-8',
        title: '8ª Corda Adulto',
        corda: 'Verde, Amarelo e Branco',
        grau: 'Monitor',
        description: 'Graduação docente habilitada a ministrar treinos sob supervisão direta do responsável técnico.',
        image: '/graduacaoes/adulto/8_verde_amarelo_branco_monitor.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Branco', hex: '#ffffff' }
        ]
      },
      {
        id: 'adulto-9',
        title: '9ª Corda Adulto',
        corda: 'Verde e Branco',
        grau: 'Instrutor',
        description: 'Grau de instrutor: expansão de turmas, formação continuada de alunos e liderança de núcleos.',
        image: '/graduacaoes/adulto/9_verde_branco_instrutor.png',
        colors: [
          { name: 'Verde', hex: '#16a34a' },
          { name: 'Branco', hex: '#ffffff' }
        ]
      },
      {
        id: 'adulto-10',
        title: '10ª Corda Adulto',
        corda: 'Amarelo e Branco',
        grau: 'Professor',
        description: 'Mestre formador de novos capoeiristas, autoridade pedagógica e guardião dos valores do grupo.',
        image: '/graduacaoes/adulto/10_amarelo_branco_professor.png',
        colors: [
          { name: 'Amarelo', hex: '#eab308' },
          { name: 'Branco', hex: '#ffffff' }
        ]
      },
      {
        id: 'adulto-11',
        title: '11ª Corda Adulto',
        corda: 'Azul e Branco',
        grau: 'Contramestre',
        description: 'Alta maestria e liderança regional no Grupo Elite Nagô, suporte direto à máxima liderança do grupo.',
        image: '/graduacaoes/adulto/11_azul_branco_contramestre.png',
        colors: [
          { name: 'Azul', hex: '#2563eb' },
          { name: 'Branco', hex: '#ffffff' }
        ]
      }
    ]
  }
];

export const GraduationSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mirim' | 'juvenil' | 'adulto'>('adulto');

  const currentSystem = GRADUATION_SYSTEMS.find((sys) => sys.id === activeTab) || GRADUATION_SYSTEMS[2];

  return (
    <section id="graduacao" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex justify-center items-center text-center max-w-3xl mx-auto mb-14 sm:mb-18">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Graduações
        </ScrollFloat>
      </div>

      {/* Tabs Switcher - Responsive horizontal scroll without scrollbar */}
      <div className="flex justify-center mb-6 sm:mb-10">
        <div className="p-1 sm:p-1.5 rounded-full flex gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl border border-white/15 overflow-x-auto max-w-full shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {GRADUATION_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setActiveTab(sys.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === sys.id
                  ? 'bg-white text-neutral-950 shadow-[0_2px_15px_rgba(255,255,255,0.25)] font-black'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{sys.title.replace('Graduações ', '')}</span>
              <span className={`text-[9px] sm:text-[10px] hidden sm:inline ${activeTab === sys.id ? 'text-neutral-700' : 'text-neutral-400'}`}>
                ({sys.ageRange})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Gallery Component Showcase */}
      <div className="w-full max-w-6xl mx-auto">
        <AccordionGallery
          key={activeTab}
          items={currentSystem.cards.map((card) => ({
            image: card.image,
            label: card.grau ? `Grau: ${card.grau}` : card.title,
            corda: card.corda,
            grau: card.grau,
            description: card.description,
            colors: card.colors,
            alt: card.title,
          }))}
          defaultIndex={Math.min(2, currentSystem.cards.length - 1)}
          expandRatio={0.52}
          trigger="hover"
          accentColor="#f59e0b"
          overlayColor="#050505"
          textColor="#ffffff"
          grayscale={false}
          showLabels={true}
          duration={1.8}
          ease="power2.out"
          parallax={0.4}
          tilt={5}
          stagger={0.04}
          height={480}
          gap={12}
          radius={20}
          orientation="horizontal"
        />
      </div>
    </section>
  );
};

export default GraduationSection;
