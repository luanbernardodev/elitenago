export interface NewsItem {
  id: string;
  title: string;
  tag: string;
  category: string;
  author?: string;
  date: string;
  summary: string;
  excerpt?: string;
  content: string;
  image?: string;
  featured?: boolean;
  status?: 'published' | 'draft';
}

export interface GraduationCordColor {
  name: string;
  hex: string;
}

export interface GraduationCard {
  id: string;
  title: string;
  corda: string;
  grau?: string;
  description: string;
  image: string;
  colors: GraduationCordColor[];
}

export interface GraduationSystem {
  id: 'mirim' | 'juvenil' | 'adulto';
  title: string;
  subtitle: string;
  ageRange: string;
  cards: GraduationCard[];
}

export interface RhythmTrack {
  id: string;
  name: string;
  instrument: string;
  tempo: string;
  description: string;
  type: string;
  category?: string;
  artist?: string;
  cover?: string;
  duration?: string;
  audioSrc?: string;
  freq: number; // Frequency for audio synthesis simulator
  pattern: number[]; // Rhythm beat pattern
}

export interface MestreInfo {
  id: string;
  name: string;
  title: string;
  bio: string;
  yearsActive: string;
  role: string;
  specialty: string;
  quote: string;
}

export interface AcademyUnit {
  id: string;
  city: string;
  neighborhood: string;
  address: string;
  responsible: string;
  days: string;
  hours: string;
  whatsapp: string;
  mapsUrl?: string;
  embedQuery?: string;
}
