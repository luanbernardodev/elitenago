import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Eye,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  Upload,
  Newspaper,
  ArrowLeft,
  Search,
  Bell,
  Settings,
  User,
  ArrowRight,
  Music,
  Play,
  Pause,
  ShieldCheck,
  Award,
  ChevronRight,
  Flame,
  Trash2,
  Pencil,
  X,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Plus,
  Building2,
  Navigation,
  UserCheck,
  AlertTriangle,
  HeartHandshake,
  Globe,
  Tag,
  Video,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { FileUpload } from '../ui/file-upload';
import { CalendarDatePicker } from '../ui/calendar-date-picker';
import { supabase, uploadToStorage, formatFileSize, triggerFileDownload, fetchSpotifyMetadata, DatabaseSponsor } from '../../lib/supabase';

interface AdminDashboardProps {
  onBackToHome?: () => void;
}

interface StudentApproval {
  id: string;
  type: 'music' | 'image' | 'video' | 'media';
  title: string;
  studentName: string;
  academy: string;
  date: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  file_size?: string | null;
  original_filename?: string | null;
  spotify_url?: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  tag?: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  content?: string;
  image: string;
  is_featured?: boolean;
  status: 'published' | 'draft';
}

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'answered' | 'archived';
}

export interface AdminAcademy {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  responsible: string;
  days: string;
  hours: string;
  mapsUrl?: string;
  embedQuery?: string;
  whatsapp?: string;
  students: number;
  max: number;
  growth: string;
}

const INITIAL_APPROVALS: StudentApproval[] = [
  {
    id: 'app-1',
    type: 'music',
    title: 'Toque de São Bento Grande com Cantiga Nova',
    studentName: 'Lucas Ferreira (Graduado)',
    academy: 'Juiz de Fora (Matriz)',
    date: '10/09/2026',
    audioUrl: 'https://cdn.freesound.org/previews/518/518884_10672049-lq.mp3',
    thumbnailUrl: 'https://i.imgur.com/A46hzMt.jpeg',
    description: 'Gravação feita após o treino de sexta com cantiga de roda tradicional e toques rápidos de berimbau.',
    status: 'pending',
  },
  {
    id: 'app-2',
    type: 'image',
    title: 'Foto da Roda de Rua em Benfica',
    studentName: 'Beatriz Vasconcelos',
    academy: 'Polo Benfica',
    date: '09/09/2026',
    imageUrl: 'https://i.imgur.com/RWa2XaP.jpeg',
    description: 'Registro em alta resolução dos alunos na roda aberta no Parque de Benfica.',
    status: 'pending',
  },
  {
    id: 'app-3',
    type: 'music',
    title: 'Corrido do Nagô Guerreiro',
    studentName: 'Marcio Silva (Monitor)',
    academy: 'Polo São Pedro',
    date: '08/09/2026',
    audioUrl: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3',
    thumbnailUrl: 'https://i.imgur.com/phPJ0Qh.jpeg',
    description: 'Áudio gravado em estúdio com coro de alunos e atabaque de marcação.',
    status: 'pending',
  },
  {
    id: 'app-4',
    type: 'image',
    title: 'Apresentação no Colégio Estadual',
    studentName: 'Camila Duarte',
    academy: 'Polo Santos Dumont',
    date: '07/09/2026',
    imageUrl: 'https://i.imgur.com/TOTCg4x.jpeg',
    description: 'Foto coletiva com os novos alunos iniciantes da oficina de capoeira.',
    status: 'approved',
  },
];

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: '3º Batizado e Troca de Cordéis - Elite Nagô 2026',
    tag: 'EVENTOS & CERIMÔNIAS',
    category: 'Eventos & Cerimônias',
    author: 'Mestre Pinheiro',
    date: '18/09/2026',
    excerpt: 'Grande encontro nacional de capoeiristas com mestres convidados de toda a região.',
    content: 'Grande encontro nacional de capoeiristas com mestres convidados de toda a região.\n\nOficinas práticas de movimentação, vivências tradicionais e cerimônia de batizado e troca de graduações.',
    image: 'https://i.imgur.com/A46hzMt.jpeg',
    is_featured: true,
    status: 'published',
  },
  {
    id: 'news-2',
    title: 'Projeto Capoeira nas Escolas alcança 200 crianças',
    tag: 'PROJETO SOCIAL',
    category: 'Projetos Sociais',
    author: 'Prof. Dom Ruan',
    date: '05/09/2026',
    excerpt: 'Aulas gratuitas de capoeira promovem disciplina, cultura e cidadania para jovens da rede pública.',
    content: 'Aulas gratuitas de capoeira promovem disciplina, cultura e cidadania para mais de 200 jovens e crianças da rede pública de ensino.',
    image: 'https://i.imgur.com/phPJ0Qh.jpeg',
    is_featured: false,
    status: 'published',
  },
];

const INITIAL_REQUESTS: ContactRequest[] = [
  {
    id: 'req-1',
    name: 'Rodrigo Mendonça',
    email: 'rodrigo.m@email.com',
    phone: '(32) 99882-1144',
    subject: 'Matrícula para meu filho de 8 anos',
    message: 'Gostaria de saber os horários das turmas infantis na academia de Benfica e os valores mensais.',
    date: '11/09/2026',
    status: 'pending',
  },
  {
    id: 'req-2',
    name: 'Secretaria de Cultura de Santos Dumont',
    email: 'cultura@santosdumont.mg.gov.br',
    phone: '(32) 3251-8800',
    subject: 'Convite para Apresentação Cultural no Festival',
    message: 'Convidamos o Grupo Elite Nagô para realizar a roda de abertura do Festival de Primavera no dia 28/09.',
    date: '10/09/2026',
    status: 'pending',
  },
  {
    id: 'req-3',
    name: 'Juliana Costa',
    email: 'juliana.capoeira@gmail.com',
    phone: '(31) 98744-2231',
    subject: 'Apoio e Parceria de Vestuário',
    message: 'Temos uma confecção de abadás personalizados e gostaríamos de propor uma cota de patrocínio.',
    date: '08/09/2026',
    status: 'answered',
  },
];

const INITIAL_ACADEMIES: AdminAcademy[] = [
  {
    id: '930ae51d-bea9-41bb-9c53-18c304b399c6',
    name: 'Polo Benfica (Zona Norte)',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Zona Norte / Benfica',
    address: 'Av. JK, 6263 - Academia M&M',
    responsible: 'Contramestre Soldado',
    days: 'Segunda, Quarta e Sexta',
    hours: '19:30 às 21:00',
    mapsUrl: 'https://maps.app.goo.gl/YQmeyfaP7Pj8gL3z6',
    embedQuery: 'Av. Pres. Juscelino Kubitschek, 6263 - Benfica, Juiz de Fora - MG',
    whatsapp: '5532984077391',
    students: 92,
    max: 100,
    growth: '+12%',
  },
  {
    id: '2faafeb7-db0e-4acb-9027-5b3906ff5656',
    name: 'Matriz Juiz de Fora (Centro)',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Centro / Matriz',
    address: 'Rua Espírito Santo, 1115 - Centro',
    responsible: 'Mestre Pinheiro',
    days: 'Segunda a Sexta',
    hours: '18:30 às 21:30',
    mapsUrl: 'https://maps.google.com/?q=Rua+Espirito+Santo+Juiz+de+Fora',
    embedQuery: 'Rua Espírito Santo, Juiz de Fora - MG',
    whatsapp: '5532984077391',
    students: 165,
    max: 180,
    growth: '+18%',
  },
  {
    id: 'ceb7ce3a-ef7f-43cf-b373-cc1537b7d79a',
    name: 'Polo São Pedro (Cidade Alta)',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Cidade Alta / São Pedro',
    address: 'Av. Presidente Costa e Silva, 1800 - São Pedro',
    responsible: 'Prof. Dom Ruan',
    days: 'Segunda, Quarta e Sexta',
    hours: '19:00 às 20:30',
    mapsUrl: 'https://maps.google.com/?q=Av+Presidente+Costa+e+Silva+Juiz+de+Fora',
    embedQuery: 'Av. Presidente Costa e Silva, São Pedro, Juiz de Fora - MG',
    whatsapp: '5532984190283',
    students: 78,
    max: 90,
    growth: '+24%',
  },
  {
    id: '249d908e-0600-4882-8d44-0bba8d26b7db',
    name: 'Polo Laranjal',
    city: 'Laranjal - MG',
    neighborhood: 'Centro',
    address: 'R. Jeremias Dias de Oliveira, S/N - Casa da Cultura',
    responsible: 'Professor Dom Ruan',
    days: 'Terça e Quinta',
    hours: '18:00 às 20:00',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Casa+da+Cultura+Rua+Jeremias+Dias+de+Oliveira+Laranjal+MG',
    embedQuery: 'R. Jeremias Dias de Oliveira, Laranjal - MG',
    whatsapp: '5532984190283',
    students: 39,
    max: 50,
    growth: '+15%',
  },
  {
    id: '152d386e-ebb1-49e7-b9c7-9e0e4dc0df3a',
    name: 'Polo Santos Dumont',
    city: 'Santos Dumont - MG',
    neighborhood: 'Centro',
    address: 'Rua Sérgio Neves, 45 - Centro',
    responsible: 'Instrutor Curió',
    days: 'Terça e Quinta',
    hours: '19:30 às 21:00',
    mapsUrl: 'https://maps.google.com/?q=Santos+Dumont+MG',
    embedQuery: 'Santos Dumont - MG',
    whatsapp: '5532984077391',
    students: 54,
    max: 70,
    growth: '+8%',
  },
];

const INITIAL_SPONSORS: DatabaseSponsor[] = [
  {
    id: 'spon-1',
    name: 'Ascomcer',
    alt: 'Logo Ascomcer',
    logo_url: '/logos/ascomcer.png',
    website_url: 'https://www.ascomcer.org.br/',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'spon-2',
    name: 'MRS Logística',
    alt: 'Logo MRS Logística',
    logo_url: '/logos/mrs.png',
    website_url: 'https://www.mrs.com.br/',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'spon-3',
    name: 'Supermercado JK',
    alt: 'Logo Supermercado JK',
    logo_url: '/logos/jk.png',
    website_url: '',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'spon-4',
    name: 'Grupo Bahamas',
    alt: 'Logo Grupo Bahamas',
    logo_url: '/logos/grupo_bahamas.png',
    website_url: 'https://www.bahamas.com.br/',
    display_order: 4,
    is_active: true,
  },
];

const TIMELINE_ORDERS = [
  { id: '1', title: 'R$ 2.400 em novas doações recebidas', time: '22 DEC 7:20 PM', color: 'bg-emerald-500', icon: DollarSign },
  { id: '2', title: 'Novo pedido de matrícula infantil #1832412', time: '21 DEC 11:00 PM', color: 'bg-rose-500', icon: MessageSquare },
  { id: '3', title: 'Áudio MP3 "São Bento Grande" enviado por aluno', time: '21 DEC 9:34 PM', color: 'bg-blue-500', icon: Music },
  { id: '4', title: 'Nova matéria "Batizado 2026" publicada no site', time: '20 DEC 2:20 AM', color: 'bg-amber-500', icon: Newspaper },
  { id: '5', title: 'Sincronização Realtime Supabase concluída', time: '18 DEC 4:54 AM', color: 'bg-cyan-500', icon: ShieldCheck },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'academies' | 'requests' | 'donations' | 'approvals' | 'direct_upload' | 'news' | 'sponsors'
  >('overview');

  const [approvals, setApprovals] = useState<StudentApproval[]>(INITIAL_APPROVALS);
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [requests, setRequests] = useState<ContactRequest[]>(INITIAL_REQUESTS);
  const [academiesList, setAcademiesList] = useState<AdminAcademy[]>(INITIAL_ACADEMIES);
  const [sponsorsList, setSponsorsList] = useState<DatabaseSponsor[]>(INITIAL_SPONSORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Upload Form State
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [directType, setDirectType] = useState<'music' | 'photo' | 'video' | 'media'>('photo');
  const [directTitle, setDirectTitle] = useState('');
  const [directAuthor, setDirectAuthor] = useState('');
  const [directCategory, setDirectCategory] = useState('Batizados & Rodas');
  const [directDescription, setDirectDescription] = useState('');
  const [directSpotifyUrl, setDirectSpotifyUrl] = useState('');
  const [directAudioFiles, setDirectAudioFiles] = useState<File[]>([]);
  const [directThumbnailFiles, setDirectThumbnailFiles] = useState<File[]>([]);
  const [directMediaFiles, setDirectMediaFiles] = useState<File[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [mediasList, setMediasList] = useState<any[]>([]);

  // News Form State
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsTag, setNewsTag] = useState('EVENTOS & CERIMÔNIAS');
  const [newsCategory, setNewsCategory] = useState('Eventos & Oficinas');
  const [newsAuthor, setNewsAuthor] = useState('Mestre Pinheiro');
  const [newsDate, setNewsDate] = useState<Date | null>(new Date());
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);
  const [newsCoverFiles, setNewsCoverFiles] = useState<File[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Academies Form & Delete Modal State
  const [editingAcademy, setEditingAcademy] = useState<AdminAcademy | null>(null);
  const [academyCity, setAcademyCity] = useState('Juiz de Fora - MG');
  const [academyNeighborhood, setAcademyNeighborhood] = useState('');
  const [academyAddress, setAcademyAddress] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [academyResponsible, setAcademyResponsible] = useState('Contramestre Soldado');
  const [academyDays, setAcademyDays] = useState('Segunda, Quarta e Sexta');
  const [academyHours, setAcademyHours] = useState('19:30 às 21:00');
  const [academyMapsUrl, setAcademyMapsUrl] = useState('');
  const [academyWhatsapp, setAcademyWhatsapp] = useState('5532984077391');
  const [academyStudents, setAcademyStudents] = useState<number>(50);
  const [academyMax, setAcademyMax] = useState<number>(100);
  const [academyLoading, setAcademyLoading] = useState(false);
  const [academyToDelete, setAcademyToDelete] = useState<AdminAcademy | null>(null);

  // Sponsors Form & Delete Modal State
  const [editingSponsor, setEditingSponsor] = useState<DatabaseSponsor | null>(null);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorAlt, setSponsorAlt] = useState('');
  const [sponsorWebsiteUrl, setSponsorWebsiteUrl] = useState('');
  const [sponsorOrder, setSponsorOrder] = useState<number>(1);
  const [sponsorLogoFiles, setSponsorLogoFiles] = useState<File[]>([]);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<DatabaseSponsor | null>(null);

  // Real-time synchronization with Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: newsData } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });

        if (newsData && newsData.length > 0) {
          setNewsList(
            newsData.map((d: any) => ({
              id: d.id,
              title: d.title,
              tag: d.tag || d.category?.toUpperCase() || 'EVENTOS & CERIMÔNIAS',
              category: d.category || 'Eventos & Oficinas',
              author: d.author || 'Mestre Pinheiro',
              date: d.date,
              excerpt: d.excerpt || d.title,
              content: d.content || d.excerpt || d.title,
              image: d.image || 'https://i.imgur.com/A46hzMt.jpeg',
              is_featured: d.is_featured ?? false,
              status: d.status || 'published',
            }))
          );
        }

        const { data: approvalsData } = await supabase
          .from('student_approvals')
          .select('*')
          .order('created_at', { ascending: false });

        if (approvalsData && approvalsData.length > 0) {
          setApprovals(
            approvalsData.map((a: any) => ({
              id: a.id,
              type: a.type,
              title: a.title,
              studentName: a.student_name,
              academy: a.academy,
              date: a.date,
              audioUrl: a.audio_url,
              thumbnailUrl: a.thumbnail_url,
              imageUrl: a.image_url,
              description: a.description,
              status: a.status,
            }))
          );
        }

        const { data: reqsData } = await supabase
          .from('contact_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (reqsData && reqsData.length > 0) {
          setRequests(reqsData);
        }

        const { data: acadData } = await supabase
          .from('academies')
          .select('*')
          .order('created_at', { ascending: true });

        if (acadData && acadData.length > 0) {
          setAcademiesList(
            acadData.map((ac: any) => ({
              id: ac.id,
              name: ac.name || ac.address || 'Unidade de Treino',
              city: ac.city || 'Juiz de Fora - MG',
              neighborhood: ac.neighborhood || 'Centro',
              address: ac.address || ac.name || 'Endereço a definir',
              responsible: ac.responsible || ac.teacher || 'Responsável',
              days: ac.days || 'Segunda, Quarta e Sexta',
              hours: ac.hours || '19:00 às 20:30',
              mapsUrl: ac.maps_url || (ac.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ac.address + ', ' + ac.city)}` : ''),
              embedQuery: ac.embed_query || `${ac.address || ac.name}, ${ac.city}`,
              whatsapp: ac.whatsapp || '5532984077391',
              students: Number(ac.students_count) || 0,
              max: Number(ac.max_capacity) || 100,
              growth: ac.growth_rate || '+10%',
            }))
          );
        }

        const { data: mediasData } = await supabase
          .from('medias')
          .select('*')
          .order('created_at', { ascending: false });

        if (mediasData && mediasData.length > 0) {
          setMediasList(mediasData);
        }

        const { data: sponsorsData } = await supabase
          .from('sponsors')
          .select('*')
          .order('display_order', { ascending: true });

        if (sponsorsData && sponsorsData.length > 0) {
          setSponsorsList(sponsorsData);
        }
      } catch (err) {
        console.warn('Supabase not yet populated or offline, using fallback state:', err);
      }
    };

    fetchSupabaseData();

    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_approvals' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medias' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Academy Form Handlers
  const handleStartEditAcademy = (item: AdminAcademy, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTab('academies');
    setEditingAcademy(item);
    setAcademyCity(item.city || 'Juiz de Fora - MG');
    setAcademyNeighborhood(item.neighborhood || '');
    setAcademyAddress(item.address || item.name || '');
    setAcademyName(item.name || '');
    setAcademyResponsible(item.responsible || 'Responsável');
    setAcademyDays(item.days || 'Segunda, Quarta e Sexta');
    setAcademyHours(item.hours || '19:30 às 21:00');
    setAcademyMapsUrl(item.mapsUrl || '');
    setAcademyWhatsapp(item.whatsapp || '5532984077391');
    setAcademyStudents(item.students || 0);
    setAcademyMax(item.max || 100);

    setTimeout(() => {
      const formElement = document.getElementById('academy-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    showToast(`Editando polo: "${item.name || item.address}"`);
  };

  const handleCancelEditAcademy = () => {
    setEditingAcademy(null);
    setAcademyCity('Juiz de Fora - MG');
    setAcademyNeighborhood('');
    setAcademyAddress('');
    setAcademyName('');
    setAcademyResponsible('Contramestre Soldado');
    setAcademyDays('Segunda, Quarta e Sexta');
    setAcademyHours('19:30 às 21:00');
    setAcademyMapsUrl('');
    setAcademyWhatsapp('5532984077391');
    setAcademyStudents(50);
    setAcademyMax(100);
  };

  const handleAcademySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyCity.trim()) {
      showToast('Informe a cidade da academia.');
      return;
    }
    if (!academyAddress.trim()) {
      showToast('Informe o endereço da academia.');
      return;
    }
    if (!academyResponsible.trim()) {
      showToast('Informe o responsável pela academia.');
      return;
    }

    setAcademyLoading(true);

    const finalNeighborhood = academyNeighborhood.trim() || 'Centro';
    const finalName = academyName.trim() || `Polo ${finalNeighborhood} (${academyCity.trim().split('-')[0].trim()})`;
    const finalEmbedQuery = `${academyAddress.trim()}, ${academyCity.trim()}`;
    const directMapsUrl = academyMapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalEmbedQuery)}`;

    if (editingAcademy) {
      // UPDATE EXISTING ACADEMY
      const updatedItem: AdminAcademy = {
        ...editingAcademy,
        name: finalName,
        city: academyCity.trim(),
        neighborhood: finalNeighborhood,
        address: academyAddress.trim(),
        responsible: academyResponsible.trim(),
        days: academyDays.trim(),
        hours: academyHours.trim(),
        mapsUrl: directMapsUrl,
        embedQuery: finalEmbedQuery,
        whatsapp: academyWhatsapp.trim() || '5532984077391',
        students: Number(academyStudents) || 0,
        max: Number(academyMax) || 100,
      };

      try {
        const { error } = await supabase
          .from('academies')
          .update({
            name: updatedItem.name,
            city: updatedItem.city,
            neighborhood: updatedItem.neighborhood,
            address: updatedItem.address,
            responsible: updatedItem.responsible,
            teacher: updatedItem.responsible,
            days: updatedItem.days,
            hours: updatedItem.hours,
            maps_url: updatedItem.mapsUrl,
            embed_query: updatedItem.embedQuery,
            whatsapp: updatedItem.whatsapp,
            students_count: updatedItem.students,
            max_capacity: updatedItem.max,
          })
          .eq('id', editingAcademy.id);

        if (error) {
          console.error('Erro ao atualizar academia no Supabase:', error);
          showToast(`Aviso: Atualizado localmente (${error.message})`);
        } else {
          showToast('Academia atualizada e sincronizada no Supabase com sucesso!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        showToast('Academia atualizada localmente.');
      }

      setAcademiesList(prev => prev.map(a => (a.id === editingAcademy.id ? updatedItem : a)));
      handleCancelEditAcademy();
    } else {
      // INSERT NEW ACADEMY
      const newItem: AdminAcademy = {
        id: `acad-${Date.now()}`,
        name: finalName,
        city: academyCity.trim(),
        neighborhood: finalNeighborhood,
        address: academyAddress.trim(),
        responsible: academyResponsible.trim(),
        days: academyDays.trim(),
        hours: academyHours.trim(),
        mapsUrl: directMapsUrl,
        embedQuery: finalEmbedQuery,
        whatsapp: academyWhatsapp.trim() || '5532984077391',
        students: Number(academyStudents) || 0,
        max: Number(academyMax) || 100,
        growth: '+10%',
      };

      try {
        const { data: insertedData, error } = await supabase
          .from('academies')
          .insert([
            {
              name: newItem.name,
              city: newItem.city,
              neighborhood: newItem.neighborhood,
              address: newItem.address,
              responsible: newItem.responsible,
              teacher: newItem.responsible,
              days: newItem.days,
              hours: newItem.hours,
              maps_url: newItem.mapsUrl,
              embed_query: newItem.embedQuery,
              whatsapp: newItem.whatsapp,
              students_count: newItem.students,
              max_capacity: newItem.max,
              growth_rate: '+10%',
            },
          ])
          .select();

        if (error) {
          console.error('Erro ao cadastrar academia no Supabase:', error);
          showToast(`Aviso: Academia inserida localmente (${error.message})`);
          setAcademiesList(prev => [...prev, newItem]);
        } else {
          if (insertedData && insertedData.length > 0) {
            newItem.id = insertedData[0].id;
          }
          setAcademiesList(prev => [...prev.filter(a => a.id !== newItem.id), newItem]);
          showToast('Nova academia cadastrada e sincronizada no Supabase com sucesso!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        setAcademiesList(prev => [...prev, newItem]);
        showToast('Academia cadastrada localmente.');
      }

      handleCancelEditAcademy();
    }

    setAcademyLoading(false);
  };

  const handleConfirmDeleteAcademy = async () => {
    if (!academyToDelete) return;
    const target = academyToDelete;
    if (editingAcademy?.id === target.id) {
      handleCancelEditAcademy();
    }
    setAcademiesList(prev => prev.filter(a => a.id !== target.id));
    setAcademyToDelete(null);

    try {
      const { error } = await supabase.from('academies').delete().eq('id', target.id);
      if (error) {
        console.warn('Erro ao deletar academia no Supabase:', error);
        showToast(`Aviso: Removido localmente (${error.message})`);
      } else {
        showToast(`Polo "${target.name || target.address}" removido do Supabase com sucesso.`);
      }
    } catch {
      showToast('Polo removido.');
    }
  };

  const handleApprove = async (id: string) => {
    const itemToApprove = approvals.find(item => item.id === id);
    setApprovals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' as const } : item))
    );
    try {
      await supabase
        .from('student_approvals')
        .update({ status: 'approved' })
        .eq('id', id);

      if (itemToApprove) {
        const isMusic = itemToApprove.type === 'music';
        const isVideo = itemToApprove.type === 'video';
        const fileType = isMusic ? 'audio' : (isVideo ? 'video' : 'photo');
        const mediaPayload = {
          title: itemToApprove.title,
          type: isMusic ? 'music' : (isVideo ? 'video' : 'image'),
          file_type: fileType,
          file_size: itemToApprove.file_size || null,
          original_filename: itemToApprove.original_filename || null,
          author: itemToApprove.studentName ? `${itemToApprove.studentName} (${itemToApprove.academy})` : 'Aluno Elite Nagô',
          category: isMusic ? 'Toques & Cantigas' : 'Batizados & Rodas',
          description: itemToApprove.description || `Mídia aprovada do aluno ${itemToApprove.studentName}.`,
          url: isMusic ? (itemToApprove.audioUrl || '') : (itemToApprove.imageUrl || ''),
          thumbnail_url: itemToApprove.thumbnailUrl || (isMusic ? '/logos/en_thumb.png' : itemToApprove.imageUrl),
          spotify_url: itemToApprove.spotify_url || null,
          status: 'approved',
          is_featured: true,
        };

        const { data: insertedMedia } = await supabase
          .from('medias')
          .insert([mediaPayload])
          .select();

        if (insertedMedia && insertedMedia.length > 0) {
          setMediasList(prev => [insertedMedia[0], ...prev.filter(m => m.id !== insertedMedia[0].id)]);
        }
      }
    } catch (err) {
      console.warn('Erro ao aprovar submissão no Supabase:', err);
    }
    showToast('Submissão do aluno aprovada e publicada na galeria!');
  };

  const handleReject = async (id: string) => {
    setApprovals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' as const } : item))
    );
    try {
      await supabase
        .from('student_approvals')
        .update({ status: 'rejected' })
        .eq('id', id);
    } catch {
      // Handled locally
    }
    showToast('Submissão rejeitada.');
  };

  const handleToggleAudio = (id: string, url?: string) => {
    if (!url) return;
    if (playingAudioId === id) {
      audioRef?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef) audioRef.pause();
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => setPlayingAudioId(null);
      setAudioRef(newAudio);
      setPlayingAudioId(id);
    }
  };

  const handleStartEditMedia = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTab('direct_upload');
    setEditingMedia(item);
    const itemType = item.file_type === 'video' || item.type === 'video'
      ? 'video'
      : (item.type === 'music' || item.file_type === 'audio' ? 'music' : 'photo');
    setDirectType(itemType);
    setDirectTitle(item.title || '');
    setDirectAuthor(item.author || 'Elite Nagô');
    setDirectCategory(item.category || 'Batizados & Rodas');
    setDirectDescription(item.description || '');
    setDirectSpotifyUrl(item.spotify_url || '');
    setDirectAudioFiles([]);
    setDirectThumbnailFiles([]);
    setDirectMediaFiles([]);

    setTimeout(() => {
      const formElement = document.getElementById('direct-upload-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    showToast(`Editando mídia: "${item.title}"`);
  };

  const handleCancelEditMedia = () => {
    setEditingMedia(null);
    setDirectTitle('');
    setDirectAuthor('');
    setDirectCategory('Batizados & Rodas');
    setDirectDescription('');
    setDirectSpotifyUrl('');
    setDirectAudioFiles([]);
    setDirectThumbnailFiles([]);
    setDirectMediaFiles([]);
  };

  const handleSpotifyUrlBlur = async () => {
    const clean = directSpotifyUrl.trim();
    if (!clean || !clean.includes('spotify.com')) return;
    try {
      const meta = await fetchSpotifyMetadata(clean);
      if (meta) {
        if (!directTitle.trim() && meta.title) {
          setDirectTitle(meta.title);
        }
        if ((!directAuthor.trim() || directAuthor === 'Elite Nagô') && meta.author) {
          setDirectAuthor(meta.author);
        }
        showToast(`Capa e informações identificadas do Spotify: "${meta.title || 'Música'}"`);
      }
    } catch { }
  };

  const handleDeleteMedia = async (id: string, title?: string) => {
    if (editingMedia?.id === id) {
      handleCancelEditMedia();
    }
    setMediasList(prev => prev.filter(m => m.id !== id));
    try {
      const { error } = await supabase.from('medias').delete().eq('id', id);
      if (error) {
        console.warn('Erro ao deletar mídia do Supabase:', error);
      } else {
        showToast(`Mídia "${title || 'Música'}" removida do Supabase.`);
      }
    } catch {
      showToast('Mídia removida.');
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directTitle.trim()) {
      showToast('Por favor, informe o título da mídia.');
      return;
    }

    const cleanSpotify = directSpotifyUrl.trim();
    const hasAudio = directAudioFiles.length > 0;
    const hasSpotify = cleanSpotify.length > 0;
    const hasMediaFiles = directMediaFiles.length > 0;
    const existingUrl = editingMedia?.url;

    if (directType === 'music' && !hasAudio && !hasSpotify && !existingUrl) {
      showToast('Para músicas, informe o link do Spotify ou selecione um arquivo de áudio MP3.');
      return;
    }
    if ((directType === 'photo' || directType === 'video' || directType === 'media') && !hasMediaFiles && !existingUrl) {
      showToast(`Por favor, selecione ao menos um arquivo de ${directType === 'video' ? 'vídeo' : 'imagem'}.`);
      return;
    }

    setDirectLoading(true);

    // MODE 1: EDITING EXISTING MEDIA
    if (editingMedia) {
      let audioUrl = editingMedia.url || '';
      let fileSize = editingMedia.file_size || null;
      let origFileName = editingMedia.original_filename || null;

      if (hasAudio) {
        const uploaded = await uploadToStorage(directAudioFiles[0], 'audio');
        if (uploaded) {
          audioUrl = uploaded.url;
          fileSize = uploaded.size;
          origFileName = uploaded.fileName;
        }
      }

      let thumbnailUrl = editingMedia.thumbnail_url;
      if (directThumbnailFiles.length > 0) {
        const uploaded = await uploadToStorage(directThumbnailFiles[0], 'thumbnails');
        if (uploaded) thumbnailUrl = uploaded.url;
      } else if ((!thumbnailUrl || thumbnailUrl === 'https://i.imgur.com/A46hzMt.jpeg') && hasSpotify) {
        const spotifyMeta = await fetchSpotifyMetadata(cleanSpotify);
        if (spotifyMeta?.thumbnail_url) thumbnailUrl = spotifyMeta.thumbnail_url;
      }

      if (!thumbnailUrl || thumbnailUrl === 'https://i.imgur.com/A46hzMt.jpeg') {
        thumbnailUrl = '/logos/en_thumb.png';
      }

      let mediaUrl = editingMedia.url;
      if (hasMediaFiles) {
        const folder = directType === 'video' ? 'videos' : 'gallery';
        const uploaded = await uploadToStorage(directMediaFiles[0], folder);
        if (uploaded) {
          mediaUrl = uploaded.url;
          fileSize = uploaded.size;
          origFileName = uploaded.fileName;
        }
      }

      const fileType = directType === 'music' ? 'audio' : (directType === 'video' ? 'video' : 'photo');
      const updatePayload = {
        title: directTitle.trim(),
        type: directType === 'music' ? 'music' : (directType === 'video' ? 'video' : 'image'),
        file_type: fileType,
        file_size: fileSize,
        original_filename: origFileName,
        author: directAuthor.trim() || 'Elite Nagô',
        category: directCategory,
        description: directDescription.trim(),
        url: directType === 'music' ? (audioUrl || '') : (mediaUrl || '/logos/en_thumb.png'),
        thumbnail_url: thumbnailUrl,
        spotify_url: hasSpotify ? cleanSpotify : null,
        status: 'approved',
      };

      try {
        const { error } = await supabase
          .from('medias')
          .update(updatePayload)
          .eq('id', editingMedia.id);

        if (error) {
          console.error('Erro ao atualizar mídia no Supabase:', error);
          showToast(`Aviso: Atualizado localmente (${error.message})`);
        } else {
          showToast(`Mídia "${directTitle}" atualizada com sucesso!`);
        }
      } catch {
        showToast(`Mídia "${directTitle}" atualizada localmente.`);
      }

      setMediasList(prev =>
        prev.map(m => (m.id === editingMedia.id ? { ...m, ...updatePayload } : m))
      );

      handleCancelEditMedia();
      setDirectLoading(false);
      return;
    }

    // MODE 2: CREATING NEW MEDIA (MUSIC)
    if (directType === 'music') {
      let audioUrl = '';
      let fileSize = null;
      let origFileName = null;

      if (hasAudio) {
        const uploaded = await uploadToStorage(directAudioFiles[0], 'audio');
        if (uploaded) {
          audioUrl = uploaded.url;
          fileSize = uploaded.size;
          origFileName = uploaded.fileName;
        } else {
          audioUrl = URL.createObjectURL(directAudioFiles[0]);
          fileSize = formatFileSize(directAudioFiles[0].size);
          origFileName = directAudioFiles[0].name;
        }
      } else if (!hasSpotify) {
        audioUrl = 'https://cdn.freesound.org/previews/518/518884_10672049-lq.mp3';
      }

      let thumbnailUrl = '';
      if (directThumbnailFiles.length > 0) {
        const uploaded = await uploadToStorage(directThumbnailFiles[0], 'thumbnails');
        thumbnailUrl = uploaded?.url || URL.createObjectURL(directThumbnailFiles[0]);
      } else if (hasSpotify) {
        const spotifyMeta = await fetchSpotifyMetadata(cleanSpotify);
        if (spotifyMeta?.thumbnail_url) {
          thumbnailUrl = spotifyMeta.thumbnail_url;
        }
      }

      if (!thumbnailUrl || thumbnailUrl === 'https://i.imgur.com/A46hzMt.jpeg') {
        thumbnailUrl = '/logos/en_thumb.png';
      }

      const payload = {
        title: directTitle.trim(),
        type: 'music',
        file_type: 'audio',
        file_size: fileSize,
        original_filename: origFileName,
        author: directAuthor.trim() || 'Elite Nagô',
        category: directCategory,
        description: directDescription.trim(),
        url: audioUrl,
        thumbnail_url: thumbnailUrl,
        status: 'approved',
        is_featured: true,
        spotify_url: hasSpotify ? cleanSpotify : null,
      };

      try {
        const { data: insertedData, error } = await supabase
          .from('medias')
          .insert([payload])
          .select();

        if (error) {
          console.error('Erro ao cadastrar música no Supabase:', error);
          showToast(`Aviso: Publicado localmente (${error.message})`);
          setMediasList(prev => [{ ...payload, id: `local-${Date.now()}` }, ...prev]);
        } else {
          if (insertedData && insertedData.length > 0) {
            setMediasList(prev => [insertedData[0], ...prev]);
          }
          showToast(`Música "${directTitle}" cadastrada e sincronizada com download direto!`);
        }
      } catch {
        setMediasList(prev => [{ ...payload, id: `local-${Date.now()}` }, ...prev]);
        showToast(`Música "${directTitle}" adicionada localmente.`);
      }
    } else {
      // MODE 3: PHOTOS OR VIDEOS (SUPPORTS MULTIPLE BATCH UPLOADS)
      const folder = directType === 'video' ? 'videos' : 'gallery';
      const isVideo = directType === 'video';
      const itemsToInsert: any[] = [];

      for (let i = 0; i < directMediaFiles.length; i++) {
        const file = directMediaFiles[i];
        const isFileVideo = isVideo || file.type.startsWith('video');
        const uploaded = await uploadToStorage(file, folder);
        const fileUrl = uploaded?.url || URL.createObjectURL(file);
        const fileSize = uploaded?.size || formatFileSize(file.size);
        const origFileName = uploaded?.fileName || file.name;

        const suffix = directMediaFiles.length > 1 ? ` (${i + 1})` : '';
        const mediaTitle = directMediaFiles.length > 1 && !directTitle.trim()
          ? file.name.replace(/\.[^/.]+$/, '')
          : `${directTitle.trim()}${suffix}`;

        const payload = {
          title: mediaTitle,
          type: isFileVideo ? 'video' : 'image',
          file_type: isFileVideo ? 'video' : 'photo',
          file_size: fileSize,
          original_filename: origFileName,
          author: directAuthor.trim() || 'Elite Nagô',
          category: directCategory,
          description: directDescription.trim() || (isFileVideo ? 'Vídeo Oficial do Grupo Elite Nagô' : 'Foto Oficial da Galeria Elite Nagô'),
          url: fileUrl,
          thumbnail_url: isFileVideo ? '/logos/en_thumb.png' : fileUrl,
          status: 'approved',
          is_featured: true,
          spotify_url: null,
        };

        itemsToInsert.push(payload);
      }

      try {
        const { data: insertedData, error } = await supabase
          .from('medias')
          .insert(itemsToInsert)
          .select();

        if (error) {
          console.error('Erro ao cadastrar mídias no Supabase:', error);
          showToast(`Aviso: Salvo localmente (${error.message})`);
          setMediasList(prev => [...itemsToInsert.map((item, idx) => ({ ...item, id: `local-${Date.now()}-${idx}` })), ...prev]);
        } else {
          if (insertedData && insertedData.length > 0) {
            setMediasList(prev => [...insertedData, ...prev]);
          }
          showToast(`${itemsToInsert.length} mídia(s) enviada(s) e publicadas com download direto!`);
        }
      } catch {
        setMediasList(prev => [...itemsToInsert.map((item, idx) => ({ ...item, id: `local-${Date.now()}-${idx}` })), ...prev]);
        showToast('Mídias adicionadas localmente.');
      }
    }

    setDirectLoading(false);
    setDirectTitle('');
    setDirectAuthor('');
    setDirectSpotifyUrl('');
    setDirectCategory('Batizados & Rodas');
    setDirectDescription('');
    setDirectAudioFiles([]);
    setDirectThumbnailFiles([]);
    setDirectMediaFiles([]);
  };

  const handleStartEdit = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNews(item);
    setNewsTitle(item.title);
    setNewsTag(item.tag || 'EVENTOS & CERIMÔNIAS');
    setNewsCategory(item.category || 'Eventos & Oficinas');
    setNewsAuthor(item.author || 'Mestre Pinheiro');
    setNewsExcerpt(item.excerpt || '');
    setNewsContent(item.content || '');
    setNewsIsFeatured(item.is_featured ?? false);
    setNewsCoverFiles([]);

    // Scroll to form
    const formElement = document.getElementById('news-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast(`Editando matéria: "${item.title}"`);
  };

  const handleCancelEdit = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsTag('EVENTOS & CERIMÔNIAS');
    setNewsCategory('Eventos & Oficinas');
    setNewsAuthor('Mestre Pinheiro');
    setNewsDate(new Date());
    setNewsExcerpt('');
    setNewsContent('');
    setNewsIsFeatured(false);
    setNewsCoverFiles([]);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) {
      showToast('Informe o título da notícia.');
      return;
    }
    let coverUrl = editingNews?.image || 'https://i.imgur.com/A46hzMt.jpeg';
    if (newsCoverFiles.length > 0) {
      const uploaded = await uploadToStorage(newsCoverFiles[0], 'news');
      coverUrl = uploaded?.url || URL.createObjectURL(newsCoverFiles[0]);
    }

    const cleanTag = newsTag.trim().toUpperCase() || 'EVENTOS & CERIMÔNIAS';

    if (editingNews) {
      // UPDATE EXISTING NEWS
      const updatedItem: NewsItem = {
        ...editingNews,
        title: newsTitle,
        tag: cleanTag,
        category: newsCategory,
        author: newsAuthor,
        date: newsDate ? newsDate.toLocaleDateString('pt-BR') : editingNews.date,
        excerpt: newsExcerpt || newsTitle,
        content: newsContent || newsExcerpt || newsTitle,
        image: coverUrl,
        is_featured: newsIsFeatured,
        status: 'published',
      };

      try {
        const { error } = await supabase
          .from('news')
          .update({
            title: updatedItem.title,
            tag: updatedItem.tag,
            category: updatedItem.category,
            author: updatedItem.author,
            date: updatedItem.date,
            excerpt: updatedItem.excerpt,
            content: updatedItem.content,
            image: updatedItem.image,
            is_featured: newsIsFeatured,
            status: 'published',
          })
          .eq('id', editingNews.id);

        if (error) {
          console.error('Erro ao atualizar notícia no Supabase:', error);
          showToast(`Aviso: Atualizado localmente (${error.message})`);
        } else {
          showToast('Notícia atualizada e sincronizada no Supabase com sucesso!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        showToast('Notícia atualizada localmente.');
      }

      setNewsList(prev => prev.map(n => n.id === editingNews.id ? updatedItem : n));
      handleCancelEdit();
    } else {
      // INSERT NEW NEWS
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: newsTitle,
        tag: cleanTag,
        category: newsCategory,
        author: newsAuthor,
        date: newsDate ? newsDate.toLocaleDateString('pt-BR') : '18/09/2026',
        excerpt: newsExcerpt || newsTitle,
        content: newsContent || newsExcerpt || newsTitle,
        image: coverUrl,
        is_featured: newsIsFeatured,
        status: 'published',
      };

      try {
        const { data: insertedData, error } = await supabase
          .from('news')
          .insert([
            {
              title: newItem.title,
              tag: newItem.tag,
              category: newItem.category,
              author: newItem.author,
              date: newItem.date,
              excerpt: newItem.excerpt,
              content: newItem.content,
              image: newItem.image,
              is_featured: newsIsFeatured,
              status: 'published',
            },
          ])
          .select();

        if (error) {
          console.error('Erro ao cadastrar notícia no Supabase:', error);
          showToast(`Aviso: Notícia adicionada localmente (${error.message})`);
          setNewsList([newItem, ...newsList]);
        } else {
          if (insertedData && insertedData.length > 0) {
            newItem.id = insertedData[0].id;
          }
          setNewsList([newItem, ...newsList.filter(n => n.id !== newItem.id)]);
          showToast('Notícia cadastrada e sincronizada no Supabase em tempo real!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        setNewsList([newItem, ...newsList]);
        showToast('Notícia adicionada localmente.');
      }

      handleCancelEdit();
    }

    setNewsLoading(false);
  };

  const handleDeleteNews = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingNews?.id === id) {
      handleCancelEdit();
    }
    setNewsList(prev => prev.filter(n => n.id !== id));
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) {
        console.warn('Erro ao deletar do Supabase:', error);
      } else {
        showToast('Notícia removida do Supabase com sucesso.');
      }
    } catch {
      // Handled
    }
  };

  // Sponsor Form Handlers
  const handleStartEditSponsor = (item: DatabaseSponsor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTab('sponsors');
    setEditingSponsor(item);
    setSponsorName(item.name || '');
    setSponsorAlt(item.alt || '');
    setSponsorWebsiteUrl(item.website_url || '');
    setSponsorOrder(item.display_order ?? 1);
    setSponsorLogoFiles([]);

    setTimeout(() => {
      const formElement = document.getElementById('sponsor-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    showToast(`Editando apoiador: "${item.name}"`);
  };

  const handleCancelEditSponsor = () => {
    setEditingSponsor(null);
    setSponsorName('');
    setSponsorAlt('');
    setSponsorWebsiteUrl('');
    setSponsorOrder(sponsorsList.length + 1);
    setSponsorLogoFiles([]);
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      showToast('Informe o nome da empresa ou apoiador.');
      return;
    }
    if (!sponsorAlt.trim()) {
      showToast('Informe a identificação / texto alt da logo.');
      return;
    }
    if (!editingSponsor && sponsorLogoFiles.length === 0) {
      showToast('Faça o upload do arquivo de logo em PNG.');
      return;
    }

    setSponsorLoading(true);

    let finalLogoUrl = editingSponsor ? editingSponsor.logo_url : '/logos/ascomcer.png';

    if (sponsorLogoFiles.length > 0) {
      try {
        const uploaded = await uploadToStorage(sponsorLogoFiles[0], 'sponsors');
        if (uploaded?.url) {
          finalLogoUrl = uploaded.url;
        } else {
          finalLogoUrl = URL.createObjectURL(sponsorLogoFiles[0]);
        }
      } catch (uploadErr) {
        console.warn('Erro ao fazer upload da logo para o storage:', uploadErr);
        finalLogoUrl = URL.createObjectURL(sponsorLogoFiles[0]);
      }
    }

    if (editingSponsor) {
      const updatedItem: DatabaseSponsor = {
        ...editingSponsor,
        name: sponsorName.trim(),
        alt: sponsorAlt.trim(),
        logo_url: finalLogoUrl,
        website_url: sponsorWebsiteUrl.trim() || null,
        display_order: Number(sponsorOrder) || 1,
      };

      try {
        const { error } = await supabase
          .from('sponsors')
          .update({
            name: updatedItem.name,
            alt: updatedItem.alt,
            logo_url: updatedItem.logo_url,
            website_url: updatedItem.website_url,
            display_order: updatedItem.display_order,
          })
          .eq('id', editingSponsor.id);

        if (error) {
          console.error('Erro ao atualizar apoiador no Supabase:', error);
          showToast(`Aviso: Atualizado localmente (${error.message})`);
        } else {
          showToast('Apoiador atualizado e sincronizado no Supabase!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        showToast('Apoiador atualizado localmente.');
      }

      setSponsorsList(prev => prev.map(s => (s.id === editingSponsor.id ? updatedItem : s)));
      handleCancelEditSponsor();
    } else {
      const newItem: DatabaseSponsor = {
        id: `spon-${Date.now()}`,
        name: sponsorName.trim(),
        alt: sponsorAlt.trim(),
        logo_url: finalLogoUrl,
        website_url: sponsorWebsiteUrl.trim() || null,
        display_order: Number(sponsorOrder) || (sponsorsList.length + 1),
        is_active: true,
      };

      try {
        const { data: insertedData, error } = await supabase
          .from('sponsors')
          .insert([
            {
              name: newItem.name,
              alt: newItem.alt,
              logo_url: newItem.logo_url,
              website_url: newItem.website_url,
              display_order: newItem.display_order,
              is_active: true,
            },
          ])
          .select();

        if (error) {
          console.error('Erro ao cadastrar apoiador no Supabase:', error);
          showToast(`Aviso: Apoiador inserido localmente (${error.message})`);
          setSponsorsList(prev => [...prev, newItem]);
        } else {
          if (insertedData && insertedData.length > 0) {
            newItem.id = insertedData[0].id;
          }
          setSponsorsList(prev => [...prev.filter(s => s.id !== newItem.id), newItem]);
          showToast('Apoiador cadastrado e sincronizado com sucesso!');
        }
      } catch (err: any) {
        console.warn('Falha na comunicação:', err);
        setSponsorsList(prev => [...prev, newItem]);
        showToast('Apoiador inserido localmente.');
      }

      handleCancelEditSponsor();
    }

    setSponsorLoading(false);
  };

  const handleConfirmDeleteSponsor = async () => {
    if (!sponsorToDelete) return;
    const toDeleteId = sponsorToDelete.id;
    const toDeleteName = sponsorToDelete.name;

    if (editingSponsor?.id === toDeleteId) {
      handleCancelEditSponsor();
    }

    setSponsorsList(prev => prev.filter(s => s.id !== toDeleteId));
    setSponsorToDelete(null);

    try {
      const { error } = await supabase.from('sponsors').delete().eq('id', toDeleteId);
      if (error) {
        console.warn('Erro ao deletar apoiador do Supabase:', error);
      } else {
        showToast(`Apoiador "${toDeleteName}" removido com sucesso.`);
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-neutral-100 flex selection:bg-[#EEDC9A] selection:text-black font-sans antialiased">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#111118]/95 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- EXACT SOFT UI SIDENAV -------------------- */}
      <aside className="w-64 xl:w-72 hidden md:flex flex-col justify-between p-4 my-4 ms-4 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-2xl backdrop-blur-xl z-20">
        <div>
          {/* Sidenav Header */}
          <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-white/10">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-[#EEDC9A] to-amber-600 shadow-md">
              <img src="/en.svg" alt="Elite Nagô" className="h-6 w-6 object-contain filter invert brightness-0" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-black text-white tracking-tight font-syne">Elite Nagô</h1>
              <span className="text-[10px] font-bold text-[#EEDC9A] uppercase tracking-wider">Elite Nagô Admin</span>
            </div>
          </div>

          {/* Sidenav Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: 'from-emerald-400 to-teal-500' },
              { id: 'academies', label: 'Academias', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { id: 'donations', label: 'Doações', icon: DollarSign, color: 'from-violet-500 to-purple-600' },
              { id: 'requests', label: 'Contatos', icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${isActive
                    ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/40 border border-white/15'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center shadow-md ${isActive ? `bg-gradient-to-tr ${item.color} text-black` : 'bg-[#15151e] text-neutral-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Gerenciamento
            </div>

            {[
              { id: 'approvals', label: 'Aprovações Alunos', icon: Award, color: 'from-amber-400 to-yellow-500' },
              { id: 'direct_upload', label: 'Upload Direto', icon: Upload, color: 'from-emerald-400 to-teal-500' },
              { id: 'news', label: 'Inserir Notícias', icon: Newspaper, color: 'from-[#EEDC9A] to-amber-600' },
              { id: 'sponsors', label: 'Apoiadores', icon: HeartHandshake, color: 'from-pink-500 to-rose-500' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${isActive
                    ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/40 border border-white/15'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center shadow-md ${isActive ? `bg-gradient-to-tr ${item.color} text-black` : 'bg-[#15151e] text-neutral-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidenav Bottom Help Card (Soft UI Documentation Widget) */}
        <div className="space-y-3 pt-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 relative overflow-hidden shadow-xl">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-black inline-block mb-3 shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h6 className="text-xs font-bold text-white mb-0.5">Need help?</h6>
            <p className="text-[11px] text-neutral-400 mb-3">Coordenação Geral Elite Nagô</p>
            <button
              onClick={() => showToast('Mestre Pinheiro: (32) 98407-7391')}
              className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all border border-white/10 cursor-pointer"
            >
              DOCUMENTATION
            </button>
          </div>

          <button
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else window.location.href = window.location.origin + window.location.pathname;
            }}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Site</span>
          </button>
        </div>
      </aside>

      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-7 min-w-0 max-w-[1600px] overflow-x-hidden">
        {/* Soft UI Topbar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="opacity-60">Pages</span>
              <span>/</span>
              <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-syne capitalize mt-0.5">
              {activeTab === 'overview' ? 'Dashboard' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#EEDC9A]/50 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
                <User className="w-3.5 h-3.5 text-[#EEDC9A]" />
                <span className="hidden xs:inline">Sign In</span>
              </div>
              <button
                onClick={() => showToast('Configurações do Soft UI Dashboard')}
                className="p-2 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => showToast('Nenhuma notificação crítica no momento.')}
                className="p-2 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </button>
            </div>
          </div>
        </header>

        {/* TAB 1: EXACT SOFT UI DASHBOARD LAYOUT */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* ROW 1: 4 Top Stat Cards (Exact Soft UI Card Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Card 1: Today's Money */}
              <div className="p-4 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Today's Money</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white font-syne">R$ 14.850</span>
                    <span className="text-xs font-bold text-emerald-400">+55%</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Today's Users */}
              <div className="p-4 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Today's Users</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white font-syne">428 Alunos</span>
                    <span className="text-xs font-bold text-emerald-400">+3%</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: New Clients */}
              <div className="p-4 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">New Clients</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white font-syne">+87</span>
                    <span className="text-xs font-bold text-rose-400">-2%</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Sales / Visits */}
              <div className="p-4 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Sales / Visits</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white font-syne">18.450</span>
                    <span className="text-xs font-bold text-emerald-400">+5%</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/20">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* ROW 2: 2 Featured Cards ("Built by developers" & "Work with the rockets") */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7-Col Card: Built by developers / Painel Elite Nagô */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex-1 space-y-3 z-10">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Built by developers</p>
                  <h3 className="text-xl font-bold text-white font-syne">Elite Nagô Dashboard</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Painel unificado com sincronização Supabase Realtime, gestão de academias, aprovação de áudios MP3 e publicação direta.
                  </p>
                  <button
                    onClick={() => setActiveTab('direct_upload')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#EEDC9A] transition-colors group pt-2"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Right Green Wave Graphic Tile */}
                <div className="w-full sm:w-56 h-40 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 relative flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0">
                  {/* Subtle Wave lines SVG */}
                  <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                    <path d="M0,30 Q50,70 100,30 T200,30 L200,100 L0,100 Z" fill="white" />
                  </svg>
                  <div className="p-4 rounded-3xl bg-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center">
                    <Flame className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Right 5-Col Card: Work with the rockets */}
              <div
                className="lg:col-span-5 p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.65)), url('https://demos.creative-tim.com/soft-ui-dashboard/assets/img/ivancik.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="space-y-2 z-10">
                  <h4 className="text-lg font-bold text-white font-syne">Work with the rockets</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A arte e a cultura da capoeira unindo tradição e tecnologia para o crescimento contínuo de todos os alunos.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('academies')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#EEDC9A] transition-colors group mt-6 z-10"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* ROW 3: Active Users (Bar Chart) & Sales Overview (Smooth Dual Waves) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 5-Col Card: Active Users with Mini Bars */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                {/* Mini Bar Chart Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161622] to-[#0c0c14] border border-white/5 mb-4 shadow-inner">
                  <div className="h-32 flex items-end justify-between gap-2 px-2">
                    {[45, 25, 60, 30, 85, 40, 70, 55, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className="w-full max-w-[14px] rounded-full bg-white/90 hover:bg-[#EEDC9A] transition-all shadow-md"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-syne mb-0.5">Active Users</h4>
                  <p className="text-xs text-emerald-400 font-bold mb-4">(+23%) than last week</p>

                  <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-white/10">
                    <div>
                      <span className="text-xs font-black text-white block">36K</span>
                      <span className="text-[10px] text-neutral-400">Users</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">2m</span>
                      <span className="text-[10px] text-neutral-400">Clicks</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">R$ 14K</span>
                      <span className="text-[10px] text-neutral-400">Sales</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">428</span>
                      <span className="text-[10px] text-neutral-400">Items</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7-Col Card: Sales Overview (Curved Wave Chart) */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-syne">Sales overview</h4>
                    <p className="text-xs text-emerald-400 font-bold">(+4%) more in 2026</p>
                  </div>
                  <span className="text-xs text-neutral-400">Valores em R$</span>
                </div>

                {/* SVG Curved Wave Graphic */}
                <div className="w-full relative h-[180px] overflow-hidden">
                  <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="softPinkWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="softDarkWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Wave 1: Pink */}
                    <path
                      d="M0,140 Q60,30 125,90 T250,50 T375,100 T500,20 L500,160 L0,160 Z"
                      fill="url(#softPinkWave)"
                    />
                    <path
                      d="M0,140 Q60,30 125,90 T250,50 T375,100 T500,20"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="3.5"
                    />

                    {/* Wave 2: Purple / Indigo */}
                    <path
                      d="M0,150 Q75,130 150,110 T300,80 T450,110 T500,60 L500,160 L0,160 Z"
                      fill="url(#softDarkWave)"
                    />
                    <path
                      d="M0,150 Q75,130 150,110 T300,80 T450,110 T500,60"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-neutral-500 pt-2 border-t border-white/5">
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>

            {/* ROW 4: Projects (Academias Table) & Orders Overview (Timeline) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 8-Col Card: Projects & Academias Table */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-syne">Projects & Academias</h4>
                    <p className="text-xs text-neutral-400">
                      <strong className="text-emerald-400">{academiesList.length} Polos ativos</strong> sincronizados com Supabase
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('academies')} className="text-xs font-bold text-[#EEDC9A] hover:underline cursor-pointer">
                    Gerenciar todos
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 text-[10px] uppercase tracking-wider">
                        <th className="pb-3 font-bold">Unidade / Polo</th>
                        <th className="pb-3 font-bold">Responsável</th>
                        <th className="pb-3 font-bold text-center">Matriculados</th>
                        <th className="pb-3 font-bold text-center">Ocupação</th>
                        <th className="pb-3 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {academiesList.map((acad) => {
                        const fillPct = Math.round(((acad.students || 0) / (acad.max || 100)) * 100);
                        return (
                          <tr key={acad.id} className="hover:bg-white/5 transition-colors group">
                            <td className="py-3.5 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-[#EEDC9A]">
                                  {acad.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-white block">{acad.name}</span>
                                  <span className="text-[10px] text-neutral-400">{acad.city} • {acad.neighborhood}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-neutral-300 font-medium">{acad.responsible}</td>
                            <td className="py-3.5 text-center font-bold text-white">{acad.students} / {acad.max}</td>
                            <td className="py-3.5">
                              <div className="flex items-center justify-center gap-2 max-w-[120px] mx-auto">
                                <span className="text-[10px] font-bold text-neutral-400">{fillPct}%</span>
                                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${fillPct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleStartEditAcademy(acad)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#EEDC9A] border border-[#EEDC9A]/30 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                title="Editar no Gerenciador"
                              >
                                <Pencil className="w-3 h-3" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 4-Col Card: Orders Overview (Timeline) */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-white font-syne">Orders overview</h4>
                  <p className="text-xs text-emerald-400 font-bold">(+24%) this month</p>
                </div>

                <div className="space-y-4">
                  {TIMELINE_ORDERS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-start gap-3 relative">
                        <div className={`p-1.5 rounded-full ${item.color} text-black flex-shrink-0 mt-0.5 shadow-md`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <span className="text-[10px] text-neutral-500 font-medium">{item.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIES MANAGEMENT SUITE (CRUD) */}
        {activeTab === 'academies' && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-syne flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-[#EEDC9A]" />
                  Gerenciador de Academias & Polos
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Cadastre, edite e remova unidades exibidas na seção <strong>"Onde Treinar"</strong> do site. Todas as alterações são sincronizadas em tempo real no Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-center">
                <span className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#EEDC9A] font-bold">
                  {academiesList.length} Unidades Ativas
                </span>
                {editingAcademy && (
                  <button
                    onClick={handleCancelEditAcademy}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar Edição
                  </button>
                )}
              </div>
            </div>

            {/* FORM CARD (INSERT & EDIT) */}
            <div id="academy-form-card" className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white font-syne flex items-center gap-2">
                    {editingAcademy ? (
                      <span className="flex items-center gap-2 text-amber-400">
                        <Pencil className="w-4 h-4" />
                        Editar Unidade de Treino
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-sans font-bold">
                          Modo Edição
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-white">
                        <Plus className="w-4 h-4 text-[#EEDC9A]" />
                        Inserir Nova Academia / Polo de Treino
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {editingAcademy
                      ? `Alterando dados do polo "${editingAcademy.name || editingAcademy.address}". Clique em Salvar para atualizar no Supabase.`
                      : 'Preencha todos os campos abaixo para disponibilizar a unidade no site oficial e no mapa interativo.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAcademySubmit} className="space-y-4">
                {/* ROW 1: Cidade, Bairro e Nome do Polo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Cidade / UF <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={academyCity}
                      onChange={(e) => setAcademyCity(e.target.value)}
                      placeholder="Ex: Juiz de Fora - MG"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['Juiz de Fora - MG', 'Laranjal - MG', 'Santos Dumont - MG', 'Matias Barbosa - MG'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAcademyCity(preset)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Bairro / Região <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={academyNeighborhood}
                      onChange={(e) => setAcademyNeighborhood(e.target.value)}
                      placeholder="Ex: Zona Norte / Benfica"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['Zona Norte / Benfica', 'Cidade do Sol', 'Cidade Alta / São Pedro', 'Centro'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAcademyNeighborhood(preset)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Nome da Unidade / Polo <span className="text-neutral-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={academyName}
                      onChange={(e) => setAcademyName(e.target.value)}
                      placeholder="Ex: Polo Benfica (Zona Norte)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      Se vazio, gerado como "Polo {academyNeighborhood || 'Unidade'}"
                    </span>
                  </div>
                </div>

                {/* ROW 2: Endereço (Texto) e Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Endereço Completo (Texto de Exibição no Card) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#EEDC9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={academyAddress}
                        onChange={(e) => setAcademyAddress(e.target.value)}
                        placeholder="Ex: Av. JK, 6263 - Academia M&M"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Responsável / Mestre / Professor <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserCheck className="w-3.5 h-3.5 text-[#EEDC9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={academyResponsible}
                        onChange={(e) => setAcademyResponsible(e.target.value)}
                        placeholder="Ex: Contramestre Soldado"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['Contramestre Soldado', 'Mestre Pinheiro', 'Professor Dom Ruan', 'Instrutor Curió'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAcademyResponsible(preset)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 3: Dias de Treino e Horário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Dias de Treino <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={academyDays}
                      onChange={(e) => setAcademyDays(e.target.value)}
                      placeholder="Ex: Segunda, Quarta e Sexta"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['Segunda, Quarta e Sexta', 'Terça e Quinta', 'Segunda a Sexta', 'Sábados (Aulão)'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAcademyDays(preset)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Horário das Aulas <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-[#EEDC9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={academyHours}
                        onChange={(e) => setAcademyHours(e.target.value)}
                        placeholder="Ex: 19:30 às 21:00"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['19:30 às 21:00', '19:00 às 20:30', '18:00 às 20:00', '09:00 às 11:00'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAcademyHours(preset)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 4: Link do Google Maps e WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Link do Google Maps <span className="text-neutral-500">(URL para abrir no GPS/Maps)</span>
                    </label>
                    <div className="relative">
                      <Navigation className="w-3.5 h-3.5 text-[#EEDC9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={academyMapsUrl}
                        onChange={(e) => setAcademyMapsUrl(e.target.value)}
                        placeholder="Ex: https://maps.app.goo.gl/YQmeyfaP7Pj8gL3z6"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      Se não informado, será gerado automaticamente um link de busca pelo endereço e cidade.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      WhatsApp para Agendar Aula Grátis <span className="text-neutral-500">(Somente números com DDD)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#EEDC9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={academyWhatsapp}
                        onChange={(e) => setAcademyWhatsapp(e.target.value)}
                        placeholder="Ex: 5532984077391"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* ROW 5: Métricas de Gestão (Matriculados e Capacidade) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Alunos Matriculados</label>
                    <input
                      type="number"
                      min={0}
                      value={academyStudents}
                      onChange={(e) => setAcademyStudents(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Capacidade Máxima da Turma</label>
                    <input
                      type="number"
                      min={1}
                      value={academyMax}
                      onChange={(e) => setAcademyMax(parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {editingAcademy && (
                    <button
                      type="button"
                      onClick={handleCancelEditAcademy}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={academyLoading}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all ${editingAcademy
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20'
                      : 'bg-gradient-to-r from-[#EEDC9A] to-[#d4be6e] text-black shadow-[#EEDC9A]/20'
                      }`}
                  >
                    {academyLoading
                      ? 'Salvando no Supabase...'
                      : editingAcademy
                        ? 'Salvar Alterações no Supabase'
                        : 'Cadastrar Academia no Supabase'}
                  </button>
                </div>
              </form>
            </div>

            {/* LIST OF REGISTERED ACADEMIES (CARDS GRID) */}
            <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white font-syne">Polos & Unidades Cadastradas</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Estas informações são exibidas nos cards da página principal e no agendamento via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {academiesList.map((acad) => {
                  const isBeingEdited = editingAcademy?.id === acad.id;
                  const fillPct = Math.round(((acad.students || 0) / (acad.max || 100)) * 100);
                  const directMapUrl = acad.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acad.address + ', ' + acad.city)}`;

                  return (
                    <div
                      key={acad.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${isBeingEdited
                        ? 'bg-amber-500/10 border-amber-400/50 shadow-xl shadow-amber-500/10'
                        : 'bg-white/5 border-white/10 hover:border-[#EEDC9A]/40 hover:bg-white/[0.07]'
                        }`}
                    >
                      <div className="space-y-3">
                        {/* Top City and Neighborhood */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-wider bg-[#EEDC9A]/15 text-[#EEDC9A] border border-[#EEDC9A]/30">
                            {acad.city}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono truncate text-right">
                            {acad.neighborhood}
                          </span>
                        </div>

                        {/* Address Title */}
                        <div>
                          <h5 className="text-base font-bold font-syne text-white leading-snug line-clamp-2">
                            {acad.address}
                          </h5>
                          {acad.name && acad.name !== acad.address && (
                            <span className="text-[11px] text-[#EEDC9A]/80 font-medium block mt-0.5">
                              {acad.name}
                            </span>
                          )}
                        </div>

                        {/* Details (Responsible & Days/Hours) */}
                        <div className="space-y-2 py-2 border-y border-white/5 text-xs text-neutral-300">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-[#EEDC9A] shrink-0" />
                            <span className="truncate">
                              Responsável: <strong className="text-white font-semibold">{acad.responsible}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#EEDC9A] shrink-0" />
                            <span className="truncate">
                              {acad.days} • <strong className="text-[#EEDC9A] font-semibold">{acad.hours}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Maps Link & WhatsApp Button */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={directMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                            title="Abrir no Google Maps"
                          >
                            <ExternalLink className="w-3 h-3 text-[#EEDC9A]" />
                            <span>Ver no Maps</span>
                          </a>

                          <a
                            href={`https://wa.me/${acad.whatsapp || '5532984077391'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 flex items-center gap-1 transition-colors"
                            title="Testar link WhatsApp"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        {/* Students Progress */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-neutral-400">
                            <span>Matriculados: <strong className="text-white">{acad.students}</strong></span>
                            <span>Capacidade: <strong className="text-white">{acad.max}</strong></span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${fillPct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={(e) => handleStartEditAcademy(acad, e)}
                          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${isBeingEdited
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#EEDC9A] hover:text-white border-[#EEDC9A]/30'
                            }`}
                          title="Alterar dados da academia"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAcademyToDelete(acad);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                          title="Excluir polo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT REQUESTS */}
        {activeTab === 'requests' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-lg font-bold text-white font-syne">Solicitações de Contato</h3>
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#EEDC9A]/30 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{req.name}</span>
                    <p className="text-xs text-[#EEDC9A]">{req.subject}</p>
                    <p className="text-xs text-neutral-400 line-clamp-1">{req.message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BILLING / DONATIONS */}
        {activeTab === 'donations' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-lg font-bold text-white font-syne">Billing & Doações</h3>
            <p className="text-xs text-neutral-400">Total Arrecadado em Setembro: <strong>R$ 14.850,00</strong></p>
          </div>
        )}

        {/* TAB 5: STUDENT APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-lg font-bold text-white font-syne">Fila de Aprovações de Alunos</h3>
            <div className="space-y-3">
              {approvals.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.type === 'music' ? (
                      <button
                        onClick={() => handleToggleAudio(item.id, item.audioUrl)}
                        className="p-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      >
                        {playingAudioId === item.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                    ) : (
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-neutral-400">Por {item.studentName} • {item.academy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                          Aprovar
                        </button>
                        <button onClick={() => handleReject(item.id)} className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">
                          Rejeitar
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400">✓ Aprovado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DIRECT UPLOAD (MP3 + OPTIONAL THUMBNAIL & SPOTIFY) */}
        {activeTab === 'direct_upload' && (
          <div id="direct-upload-form-card" className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-syne flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#EEDC9A]" />
                  {editingMedia ? (
                    <span className="flex items-center gap-2 text-amber-400">
                      Editar Mídia / Música
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-sans font-bold">
                        Modo Edição
                      </span>
                    </span>
                  ) : (
                    'Upload Direto de Mídias & Músicas (Admin)'
                  )}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editingMedia
                    ? `Alterando os dados de "${editingMedia.title}". Salve para atualizar no Supabase.`
                    : 'Publique ou atualize músicas (com áudio MP3 ou link do Spotify) e fotos da galeria.'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                {editingMedia && (
                  <button
                    type="button"
                    onClick={handleCancelEditMedia}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar Edição
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-400 font-bold">
                  {mediasList.length} Mídias no Supabase
                </span>
              </div>
            </div>

            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div className="flex gap-2.5 mb-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setDirectType('photo');
                    setDirectCategory('Batizados & Rodas');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${directType === 'photo' || directType === 'media'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Foto / Galeria
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirectType('video');
                    setDirectCategory('Batizados & Rodas');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${directType === 'video'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Vídeo (MP4, WEBM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirectType('music');
                    setDirectCategory('Toques & Cantigas');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${directType === 'music'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  Música / Áudio MP3
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    {directType === 'music' ? 'Título da Música' : (directType === 'video' ? 'Título do Vídeo' : 'Título da(s) Foto(s)')}
                  </label>
                  <input
                    type="text"
                    placeholder={directType === 'music' ? 'Ex: Toque de São Bento Grande' : 'Ex: Batizado & Troca de Cordas 2026'}
                    value={directTitle}
                    onChange={(e) => setDirectTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Autor / Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Mestre Pinheiro ou Contramestre Soldado"
                    value={directAuthor}
                    onChange={(e) => setDirectAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Categoria</label>
                  <select
                    value={directCategory}
                    onChange={(e) => setDirectCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14141e] border border-white/10 text-xs text-white"
                  >
                    <option value="Batizados & Rodas">Batizados & Rodas</option>
                    <option value="Aulas e Treinos">Aulas e Treinos</option>
                    <option value="Toques & Cantigas">Toques & Cantigas</option>
                    <option value="Histórico & Tradição">Histórico & Tradição</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais sobre esta mídia..."
                  value={directDescription}
                  onChange={(e) => setDirectDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white resize-none"
                />
              </div>

              {/* Spotify Link Field (for Music) */}
              {directType === 'music' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1DB954]/10 to-transparent border border-[#1DB954]/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] shadow-sm shadow-[#1DB954]/50 animate-pulse" />
                      Link da Música no Spotify
                    </label>
                    {directSpotifyUrl.trim() ? (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        ✓ Link informado — Arquivo MP3 opcional
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                        Opcional caso anexe arquivo MP3
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Ex: https://open.spotify.com/track/... ou link de faixa/álbum"
                    value={directSpotifyUrl}
                    onChange={(e) => setDirectSpotifyUrl(e.target.value)}
                    onBlur={handleSpotifyUrlBlur}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-[#1DB954]/30 focus:border-[#1DB954] text-xs text-white placeholder:text-neutral-500 outline-none transition-all"
                  />
                  <p className="text-[11px] text-neutral-400">
                    {directSpotifyUrl.trim()
                      ? 'Ao salvar, os botões e players do site abrirão diretamente esta faixa no Spotify.'
                      : 'Cole aqui o link direto do Spotify. Se preenchido, você não precisa fazer upload do arquivo MP3.'}
                  </p>
                </div>
              )}

              {/* Uploads according to type */}
              {directType === 'music' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      1. Arquivo de Áudio MP3 / WAV {directSpotifyUrl.trim() ? '(Opcional — Link Spotify informado)' : '(Obrigatório sem link Spotify)'}
                    </label>
                    <FileUpload
                      accept="audio/*,.mp3,.wav,.ogg"
                      maxFiles={1}
                      label="Selecione o arquivo de áudio aqui"
                      onChange={(files) => setDirectAudioFiles(files)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      2. Thumbnail / Capa (Opcional)
                    </label>
                    <FileUpload
                      accept="image/*"
                      maxFiles={1}
                      label="Selecione a thumbnail opcional aqui"
                      onChange={(files) => setDirectThumbnailFiles(files)}
                    />
                  </div>
                </div>
              ) : directType === 'video' ? (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Arquivos de Vídeo (MP4, WEBM, MOV)
                  </label>
                  <FileUpload
                    accept="video/*,.mp4,.webm,.mov"
                    maxFiles={5}
                    label="Selecione os vídeos aqui (Upload Direto)"
                    onChange={(files) => setDirectMediaFiles(files)}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Fotos / Imagens da Galeria (Permite múltiplos arquivos)
                  </label>
                  <FileUpload
                    accept="image/*"
                    maxFiles={10}
                    label="Selecione as imagens aqui (Upload Direto com Download Liberado)"
                    onChange={(files) => setDirectMediaFiles(files)}
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={directLoading}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {directLoading
                    ? 'Salvando no Supabase...'
                    : (editingMedia ? 'Salvar Alterações na Mídia' : 'Publicar Diretamente no Site')}
                </button>
              </div>
            </form>

            {/* LIST OF REGISTERED MEDIAS & MUSICS IN SUPABASE */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-400" />
                    Mídias e Músicas Cadastradas ({mediasList.length})
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Itens sincronizados com a tabela <code className="text-emerald-300 bg-white/5 px-1.5 py-0.5 rounded text-[11px]">medias</code> do Supabase
                  </p>
                </div>
              </div>

              {mediasList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-neutral-400 text-xs">
                  Nenhuma mídia cadastrada ainda no banco. Use o formulário acima para publicar a primeira!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {mediasList.map((item) => {
                    const isItemVideo = item.file_type === 'video' || item.type === 'video';
                    const isItemMusic = item.type === 'music' || item.file_type === 'audio';
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex items-start gap-3.5 group"
                      >
                        <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {isItemVideo ? (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center relative">
                              <Video className="w-6 h-6 text-indigo-400" />
                            </div>
                          ) : item.thumbnail_url || item.url ? (
                            <img
                              src={item.thumbnail_url || item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-5 h-5 text-neutral-500" />
                          )}
                          {isItemMusic && item.url && (
                            <button
                              type="button"
                              onClick={() => handleToggleAudio(item.id, item.url)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              {playingAudioId === item.id ? (
                                <Pause className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Play className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isItemMusic
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : isItemVideo
                                ? 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30'
                                : 'bg-teal-400/20 text-teal-300 border border-teal-400/30'
                              }`}>
                              {isItemMusic ? 'Música' : isItemVideo ? 'Vídeo' : 'Foto'}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate">
                              {item.category || 'Geral'}
                            </span>
                            {item.file_size && (
                              <span className="text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                                {item.file_size}
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                          <p className="text-[11px] text-neutral-400 truncate">{item.author || 'Elite Nagô'}</p>

                          {/* Badges / Links / Download Button */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {item.spotify_url && (
                              <a
                                href={item.spotify_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-[#1DB954] hover:text-[#1ed760] flex items-center gap-1 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 px-2 py-0.5 rounded-lg border border-[#1DB954]/30 transition-all"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Spotify
                              </a>
                            )}
                            {item.url && isItemMusic && (
                              <button
                                type="button"
                                onClick={() => handleToggleAudio(item.id, item.url)}
                                className="text-[11px] font-semibold text-neutral-300 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 transition-all cursor-pointer"
                              >
                                {playingAudioId === item.id ? (
                                  <>
                                    <Pause className="w-3 h-3 text-amber-400" /> Pausar
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 text-emerald-400" /> Ouvir MP3
                                  </>
                                )}
                              </button>
                            )}
                            {item.url && (
                              <button
                                type="button"
                                onClick={() => triggerFileDownload(item.url, item.original_filename || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${isItemMusic ? 'mp3' : isItemVideo ? 'mp4' : 'jpg'}`, item.id)}
                                className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition-all cursor-pointer"
                                title="Baixar arquivo original"
                              >
                                <Download className="w-3 h-3" /> Baixar
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditMedia(item)}
                            title="Editar esta mídia"
                            className="p-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item.id, item.title)}
                            title="Deletar mídia do banco"
                            className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: NEWS MANAGER */}
        {activeTab === 'news' && (
          <div id="news-form-card" className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-syne flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#EEDC9A]" />
                  {editingNews ? (
                    <span className="flex items-center gap-2 text-amber-400">
                      Editar Notícia Publicada
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-sans font-bold">
                        Modo Edição
                      </span>
                    </span>
                  ) : (
                    'Inserir Notícias no Site'
                  )}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editingNews
                    ? `Alterando os dados da matéria "${editingNews.title}". Salve para atualizar no Supabase.`
                    : 'Publique novidades com título, tag em destaque, categoria, data e descrição completa.'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                {editingNews && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar Edição
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#EEDC9A] font-bold">
                  {newsList.length} Notícias Ativas
                </span>
              </div>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Título da Notícia <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Ex: 3º Batizado e Troca de Cordéis - Elite Nagô 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                  />
                </div>
                <div>
                  <CalendarDatePicker label="Data de Publicação" value={newsDate} onChange={setNewsDate} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Tag / Badge Dourado <span className="text-[#EEDC9A]">(Banner/Card)</span>
                  </label>
                  <input
                    type="text"
                    value={newsTag}
                    onChange={(e) => setNewsTag(e.target.value.toUpperCase())}
                    placeholder="Ex: EVENTOS & CERIMÔNIAS"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-[#EEDC9A] font-bold focus:border-[#EEDC9A] outline-none tracking-wider"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['EVENTOS & CERIMÔNIAS', 'DESTAQUE', 'WORKSHOP', 'PROJETO SOCIAL', 'BATIZADO'].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setNewsTag(preset)}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#EEDC9A]/20 text-neutral-300 hover:text-[#EEDC9A] border border-white/10 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Categoria</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14141e] border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                  >
                    <option value="Eventos & Cerimônias">Eventos & Cerimônias</option>
                    <option value="Eventos & Oficinas">Eventos & Oficinas</option>
                    <option value="Cultura & Música">Cultura & Música</option>
                    <option value="Projetos Sociais">Projetos Sociais</option>
                    <option value="Competição & Jogos">Competição & Jogos</option>
                    <option value="Avisos & Comunicados">Avisos & Comunicados</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Autor / Responsável</label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    placeholder="Ex: Mestre Pinheiro"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Resumo Curto (Descrição de destaque no Card)
                </label>
                <input
                  type="text"
                  value={newsExcerpt}
                  onChange={(e) => setNewsExcerpt(e.target.value)}
                  placeholder="Ex: Grande encontro nacional de capoeiristas com mestres convidados de toda a região."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-[#EEDC9A] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Conteúdo Completo (Modal de Leitura)</label>
                <textarea
                  rows={4}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Escreva todo o texto, detalhes da programação, inscrições e informações da matéria..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white resize-none focus:border-[#EEDC9A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Capa da Matéria {editingNews && '(Deixe vazio para manter a atual)'}
                  </label>
                  <FileUpload accept="image/*" maxFiles={1} onChange={setNewsCoverFiles} />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Destacar no Bento Grid Principal</span>
                    <span className="text-[11px] text-neutral-400">Exibe como matéria de maior evidência no site</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsIsFeatured}
                    onChange={(e) => setNewsIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-[#EEDC9A] cursor-pointer rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {editingNews && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={newsLoading}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all ${editingNews
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20'
                    : 'bg-gradient-to-r from-[#EEDC9A] to-[#d4be6e] text-black shadow-[#EEDC9A]/20'
                    }`}
                >
                  {newsLoading
                    ? 'Salvando...'
                    : editingNews
                      ? 'Salvar Alterações no Supabase'
                      : 'Publicar Notícia no Supabase'}
                </button>
              </div>
            </form>

            {/* List of Published News */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white font-syne">Notícias Cadastradas</h4>
              <div className="space-y-2">
                {newsList.map((item) => {
                  const isBeingEdited = editingNews?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isBeingEdited
                        ? 'bg-amber-500/10 border-amber-400/50 shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] px-2 py-0.5 rounded font-bold font-syne uppercase bg-[#EEDC9A]/10 text-[#EEDC9A] border border-[#EEDC9A]/30">
                            {item.tag || item.category?.toUpperCase() || 'DESTAQUE'}
                          </span>
                          <span className="text-[10px] text-neutral-400">{item.category}</span>
                          <span className="text-[10px] text-neutral-500">• {item.date}</span>
                          {item.is_featured && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                              Destaque
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-white line-clamp-1">{item.title}</h5>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">{item.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {item.status || 'published'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(item, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isBeingEdited
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#EEDC9A] hover:text-white border-[#EEDC9A]/30'
                            }`}
                          title="Alterar notícia"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNews(item.id, e)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
                          title="Excluir notícia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SPONSORS (APOIADORES & PARCEIROS) */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0e0e14]/90 via-[#16121c]/90 to-[#0e0e14]/90 border border-white/10 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white font-syne">Apoiadores & Patrocinadores</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-wider">
                      Carrossel Oficial
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cadastre, edite e gerencie as marcas parceiras exibidas no carrossel do site com logos em PNG transparente.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="block text-base font-black text-white font-syne">{sponsorsList.length}</span>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Parceiros</span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div id="sponsor-form-card" className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-black shadow-md ${editingSponsor ? 'bg-gradient-to-tr from-amber-400 to-yellow-500' : 'bg-gradient-to-tr from-pink-500 to-rose-500'}`}>
                    {editingSponsor ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-syne">
                      {editingSponsor ? `Editar Apoiador: ${editingSponsor.name}` : 'Inserir Novo Apoiador'}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {editingSponsor ? 'Atualize as informações e a imagem da logo do parceiro selecionado.' : 'Preencha os campos abaixo e faça o upload da logo em PNG na proporção do carrossel.'}
                    </p>
                  </div>
                </div>
                {editingSponsor && (
                  <button
                    type="button"
                    onClick={handleCancelEditSponsor}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar Edição</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSponsorSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome da Empresa */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Nome da Empresa / Apoiador <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="Ex: Grupo Bahamas, Supermercado JK, MRS Logística..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                  </div>

                  {/* Identificação / alt= */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Identificação da Logo (alt=) <span className="text-rose-400">*</span>
                      <span className="text-[10px] font-normal text-pink-400 ml-2">(Para sabermos qual logo é)</span>
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={sponsorAlt}
                        onChange={(e) => setSponsorAlt(e.target.value)}
                        placeholder="Ex: Logo Supermercado JK, Logo Ascomcer..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Link do Website */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Link do Site / Rede Social (Opcional)
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={sponsorWebsiteUrl}
                        onChange={(e) => setSponsorWebsiteUrl(e.target.value)}
                        placeholder="https://empresa.com.br"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Ordem de Exibição */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Ordem de Exibição no Carrossel
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={sponsorOrder}
                      onChange={(e) => setSponsorOrder(Number(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Upload de Logo PNG */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Upload de Logo em PNG {editingSponsor && '(Deixe vazio para manter a atual)'} <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                      Proporção do carrossel (altura ~58px com fundo transparente)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    <div className="lg:col-span-2">
                      <FileUpload
                        onChange={(files) => setSponsorLogoFiles(files)}
                        accept="image/png,image/*"
                        maxFiles={1}
                      />
                    </div>

                    {/* Preview matching carousel container */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Prévia no Carrossel
                      </span>
                      <div className="w-full h-20 bg-white/95 rounded-xl p-2 shadow-sm flex items-center justify-center overflow-hidden border border-neutral-200">
                        {sponsorLogoFiles.length > 0 ? (
                          <img
                            src={URL.createObjectURL(sponsorLogoFiles[0])}
                            alt={sponsorAlt || 'Prévia da Logo'}
                            className="max-h-14 max-w-full object-contain"
                          />
                        ) : editingSponsor?.logo_url ? (
                          <img
                            src={editingSponsor.logo_url}
                            alt={sponsorAlt || editingSponsor.alt}
                            className="max-h-14 max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-400 text-xs gap-1">
                            <ImageIcon className="w-5 h-5 text-neutral-300" />
                            <span className="text-[11px] text-neutral-500">Nenhuma logo carregada</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono truncate max-w-full">
                        {sponsorAlt ? `alt="${sponsorAlt}"` : 'Preencha o campo alt='}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {editingSponsor && (
                    <button
                      type="button"
                      onClick={handleCancelEditSponsor}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={sponsorLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {sponsorLoading ? (
                      <span>Salvando no Supabase...</span>
                    ) : editingSponsor ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Salvar Alterações</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Cadastrar Apoiador</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Sponsors Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-syne uppercase tracking-wider flex items-center gap-2">
                  <span>Apoiadores Cadastrados</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold">
                    {sponsorsList.length} marcas
                  </span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sponsorsList.map((sponsor, idx) => {
                  const isBeingEdited = editingSponsor?.id === sponsor.id;
                  return (
                    <div
                      key={sponsor.id}
                      className={`p-4 rounded-3xl bg-[#0e0e14]/90 border transition-all flex flex-col justify-between space-y-3 ${isBeingEdited
                          ? 'border-pink-500/60 bg-pink-950/20 shadow-xl shadow-pink-500/10'
                          : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-neutral-300">
                            #{sponsor.display_order ?? idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Ativo
                          </span>
                        </div>

                        {/* Logo Container Matching Carousel Style */}
                        <div className="w-full h-20 bg-white/95 rounded-2xl p-2.5 shadow-sm flex items-center justify-center overflow-hidden border border-neutral-200/80 mb-3">
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.alt || sponsor.name}
                            className="max-h-14 max-w-full object-contain"
                          />
                        </div>

                        {/* Sponsor Name */}
                        <h5 className="text-sm font-bold text-white font-syne truncate mb-1" title={sponsor.name}>
                          {sponsor.name}
                        </h5>

                        {/* Alt Field Tag */}
                        <div className="flex items-start gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
                          <Tag className="w-3 h-3 text-pink-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-neutral-300 font-mono line-clamp-2" title={`alt="${sponsor.alt}"`}>
                            <span className="text-pink-400 font-semibold">alt=</span>"{sponsor.alt || sponsor.name}"
                          </p>
                        </div>

                        {/* Website Link */}
                        {sponsor.website_url ? (
                          <a
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#EEDC9A] hover:underline truncate max-w-full"
                            title={sponsor.website_url}
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{sponsor.website_url.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-neutral-500 italic">Sem link de website</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={(e) => handleStartEditSponsor(sponsor, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${isBeingEdited
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/30'
                            }`}
                          title="Editar apoiador"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSponsorToDelete(sponsor)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title="Excluir apoiador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-6 rounded-3xl bg-[#0e0e14] border border-white/15 text-white space-y-4"
            >
              <h4 className="text-base font-bold font-syne">{selectedRequest.subject}</h4>
              <p className="text-xs text-neutral-400">De: {selectedRequest.name} ({selectedRequest.phone})</p>
              <p className="text-xs text-neutral-200 bg-white/5 p-3.5 rounded-xl">{selectedRequest.message}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold cursor-pointer hover:bg-white/20 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Academy Confirmation Modal */}
      <AnimatePresence>
        {academyToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setAcademyToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-3xl bg-[#111118] border border-rose-500/30 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-syne text-white">Confirmar Exclusão de Polo</h4>
                  <p className="text-xs text-neutral-400">Esta ação removerá a unidade do site e do Supabase.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                <p className="text-[#EEDC9A] font-bold">{academyToDelete.city} • {academyToDelete.neighborhood}</p>
                <p className="font-bold text-white text-sm">{academyToDelete.address}</p>
                <p className="text-neutral-400">Responsável: {academyToDelete.responsible}</p>
                <p className="text-neutral-400">{academyToDelete.days} ({academyToDelete.hours})</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAcademyToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAcademy}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Definitivamente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Sponsor Confirmation Modal */}
      <AnimatePresence>
        {sponsorToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSponsorToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-3xl bg-[#111118] border border-rose-500/30 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-syne text-white">Confirmar Exclusão de Apoiador</h4>
                  <p className="text-xs text-neutral-400">Esta ação removerá a marca parceira do site e do carrossel.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-full h-16 bg-white/95 rounded-xl p-2 flex items-center justify-center border border-neutral-200">
                  <img
                    src={sponsorToDelete.logo_url}
                    alt={sponsorToDelete.alt || sponsorToDelete.name}
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white text-sm">{sponsorToDelete.name}</p>
                  <p className="text-neutral-400 font-mono"><span className="text-pink-400 font-bold">alt:</span> "{sponsorToDelete.alt}"</p>
                  {sponsorToDelete.website_url && (
                    <p className="text-neutral-400 truncate">{sponsorToDelete.website_url}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSponsorToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSponsor}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Definitivamente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

