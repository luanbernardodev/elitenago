import React from 'react';
import { ScrollFloat } from './ScrollFloat';
import { CardSwap, Card } from './ui/CardSwap';

interface LeadershipMember {
  id: string;
  name: string;
  title: string;
  role: string;
  yearsActive: string;
  specialty: string;
  quote: string;
  image: string;
}

const LEADERSHIP: LeadershipMember[] = [
  {
    id: 'mestre-pinheiro',
    name: 'Mestre Pinheiro',
    title: 'Mestre & Liderança Geral',
    role: 'Coordenação Geral',
    yearsActive: '35+ Anos de Capoeira',
    specialty: 'Mandinga, Toques de Berimbau & Tradição',
    quote: 'Frase utilizada pelo Mestre Pinheiro',
    image: '/img/mestre_pinheiro.jpg',
  },
  {
    id: 'cm-soldado',
    name: 'Contramestre Soldado',
    title: 'Fundador do Grupo Elite Nagô',
    role: 'Coordenação de Ensino',
    yearsActive: '22 Anos de Capoeira',
    specialty: 'São Bento Grande, Agilidade & Floreios',
    quote: 'Frase utilizada pelo Contramestre soldado',
    image: '/img/cm_soldado.jpg',
  },
  {
    id: 'prof-dom-ruan',
    name: 'Professor Dom Ruan',
    title: 'Desenvolvimento & Projetos',
    role: 'Diretor de Projetos Infantis',
    yearsActive: '15 Anos de Capoeira',
    specialty: 'Pedagogia da Capoeira Infantil & Cidadania',
    quote: 'Frase utilizada pelo Professor Dom Ruan',
    image: '/img/professor_dom_ruan.jpeg',
  },
];

export const MestresSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = React.useState(0);

  return (
    <section id="sobre" className="relative py-16 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 overflow-hidden">
      {/* Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-8">
        {/* Left Editorial History & Mission */}
        <div className="lg:col-span-6 space-y-6">
          <div className="mb-4 sm:mb-6">
            <ScrollFloat containerClassName="text-2xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight leading-[1.2] block">
              A Arte da Capoeira Nagô
            </ScrollFloat>
          </div>

          <p className="text-xs sm:text-base text-neutral-300 font-light leading-relaxed">
            O Grupo Elite Nagô nasceu com a missão de honrar as raízes afro-brasileiras, cultivando o respeito, a fraternidade, a disciplina e a máxima expressão corporal da Capoeira.
          </p>

          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            Nossos treinos integram a preparação física de alto rendimento, o domínio musical e a filosofia de vida transmitida através de gerações de mestres.
          </p>
        </div>

        {/* Right Leadership Showcase with CardSwap */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[440px] sm:min-h-[500px] w-full py-4 overflow-visible">
          <CardSwap
            width={310}
            height={420}
            cardDistance={40}
            verticalDistance={44}
            delay={4500}
            pauseOnHover={true}
            skewAmount={3}
            activeIndex={activeIdx}
            onActiveIndexChange={setActiveIdx}
            className="scale-[0.88] xs:scale-[0.95] sm:scale-100"
          >
            {LEADERSHIP.map((member) => (
              <Card
                key={member.id}
                className="group select-none cursor-pointer border border-white/20 hover:border-amber-400/80 shadow-2xl hover:shadow-[0_0_35px_rgba(238,220,154,0.3)] transition-all active:scale-[0.98]"
              >
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-neutral-950">
                  {/* Member Photo */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for Editorial Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Bottom Info Content */}
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-2 pointer-events-none">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-semibold block">
                        {member.title}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-syne text-white leading-tight">
                        {member.name}
                      </h3>
                    </div>

                    <p className="text-xs text-neutral-300 font-light line-clamp-2 leading-relaxed">
                      {member.specialty}
                    </p>

                    <div className="pt-2 border-t border-white/15">
                      <p className="text-[11px] font-mono text-amber-200/90 italic">
                        "{member.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>

          {/* Interactive Mestre Selector Pills */}
          <div className="flex items-center justify-center gap-2 mt-8 z-20">
            {LEADERSHIP.map((member, i) => {
              const isActive = activeIdx === i;
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveIdx(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-neutral-900/80 text-neutral-400 border border-white/10 hover:border-amber-400/40 hover:text-white'
                  }`}
                  aria-label={`Ver ${member.name}`}
                >
                  {member.name.split(' ')[0]} {member.name.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MestresSection;

