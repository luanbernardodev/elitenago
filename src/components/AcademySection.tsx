import React from 'react';
import { Clock, UserCheck } from 'lucide-react';
import { AcademyUnit } from '../types';
import { ScrollFloat } from './ScrollFloat';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { StarBorder } from './ui/StarBorder';

const ACADEMIES: AcademyUnit[] = [
  {
    id: 'unit-1',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Zona Norte / Benfica',
    address: 'Av. JK, 6263 - Academia M&M',
    responsible: 'Contramestre Soldado',
    days: 'Segunda, Quarta e Sexta',
    hours: '19:30 às 21:00',
    whatsapp: '5532984077391',
    mapsUrl: 'https://maps.app.goo.gl/YQmeyfaP7Pj8gL3z6',
    embedQuery: 'Av. Pres. Juscelino Kubitschek, 6263 - Benfica, Juiz de Fora - MG',
  },
  {
    id: 'unit-2',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Cidade do Sol',
    address: 'Praça do Cidade do Sol, S/N',
    responsible: 'Contramestre Soldado',
    days: 'Terça e Quinta',
    hours: '19:00 às 20:30',
    whatsapp: '5532984077391',
    mapsUrl: 'https://maps.app.goo.gl/GTXVbYi6ikJYB1xs6',
    embedQuery: 'Praça do Cidade do Sol, Juiz de Fora - MG',
  },
  {
    id: 'unit-3',
    city: 'Laranjal - MG',
    neighborhood: 'Centro',
    address: 'R. Jeremias Dias de Oliveira, S/N - Casa da Cultura',
    responsible: 'Professor Dom Ruan',
    days: 'Terça e Quinta',
    hours: '18:00 às 20:00',
    whatsapp: '5532984190283',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Casa+da+Cultura+Rua+Jeremias+Dias+de+Oliveira+Laranjal+MG',
    embedQuery: 'R. Jeremias Dias de Oliveira, Laranjal - MG',
  },
];

export const AcademySection: React.FC = () => {
  return (
    <section id="academias" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col justify-center items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16 w-full">
        <ScrollFloat
          containerClassName="text-3xl sm:text-4xl lg:text-5xl font-black font-syne text-white uppercase tracking-tight flex justify-center text-center"
          textClassName="justify-center text-center"
        >
          Onde Treinar
        </ScrollFloat>
      </div>

      {/* Academy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch w-full max-w-md md:max-w-none mx-auto justify-center">
        {ACADEMIES.map((unit) => {
          const mapQuery = encodeURIComponent(unit.embedQuery || `${unit.address}, ${unit.city}`);
          const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
          const directMapsUrl = unit.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

          return (
            <div key={unit.id} className="h-full w-full flex flex-col items-center justify-center mx-auto">
              <div className="p-5 sm:p-7 h-full w-full flex flex-col justify-between bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#EEDC9A]/40 rounded-3xl shadow-2xl hover:bg-black/75 transition-all duration-300">
                <div className="flex flex-col flex-1 w-full">
                  {/* Top Tag & Neighborhood */}
                  <div className="flex items-center justify-between gap-2 mb-4 h-8 min-w-0 w-full">
                    <StarBorder
                      as="div"
                      color="#EEDC9A"
                      speed="4s"
                      thickness={1}
                      backgroundColor="rgba(20, 20, 25, 0.85)"
                      borderColor="rgba(238, 220, 154, 0.3)"
                      className="shrink-0"
                      innerClassName="px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-syne font-bold uppercase tracking-wider text-amber-200 shadow-sm whitespace-nowrap"
                    >
                      {unit.city}
                    </StarBorder>
                    <span className="text-xs text-neutral-400 font-mono text-right truncate">
                      {unit.neighborhood}
                    </span>
                  </div>

                  {/* Title with uniform height */}
                  <div className="h-14 sm:h-16 flex items-start mb-3 w-full">
                    <h3 className="text-lg sm:text-xl font-bold font-syne text-white leading-snug line-clamp-2 w-full text-left">
                      {unit.address}
                    </h3>
                  </div>

                  {/* Details (Responsible & Days/Hours) with uniform height */}
                  <div className="min-h-[72px] sm:min-h-[76px] flex flex-col justify-center space-y-2.5 text-xs text-neutral-300 font-light mb-4 pb-1 w-full">
                    <div className="flex items-center gap-2 w-full">
                      <UserCheck className="w-4 h-4 text-[#EEDC9A] shrink-0" />
                      <span className="truncate">
                        Responsável: <strong className="text-[#EEDC9A] font-semibold">{unit.responsible}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <Clock className="w-4 h-4 text-[#EEDC9A] shrink-0" />
                      <span className="truncate">
                        {unit.days} • <strong className="text-[#EEDC9A] font-semibold">{unit.hours}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Google Maps Direct Clickable Preview Box */}
                  <a
                    href={directMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Abrir localização no Google Maps: ${unit.address}`}
                    className="relative block rounded-2xl overflow-hidden border border-white/10 hover:border-[#EEDC9A]/40 group/map mb-5 h-44 w-full bg-neutral-900/80 shadow-lg hover:shadow-[0_0_25px_rgba(238,220,154,0.2)] transition-all duration-300 shrink-0 cursor-pointer"
                  >
                    <iframe
                      title={`Mapa ${unit.address}`}
                      src={embedUrl}
                      className="w-full h-full border-0 group-hover/map:scale-105 transition-transform duration-500 pointer-events-none block"
                      loading="lazy"
                    />
                  </a>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2 border-t border-white/5 w-full flex items-center justify-center">
                  <a
                    href={`https://wa.me/${unit.whatsapp}?text=Olá!%20Gostaria%20de%20saber%20mais%20informações%20sobre%20aulas%20na%20unidade%20${encodeURIComponent(unit.neighborhood)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center"
                  >
                    <InteractiveHoverButton className="w-full py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center">
                      Agendar Aula Grátis
                    </InteractiveHoverButton>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AcademySection;

