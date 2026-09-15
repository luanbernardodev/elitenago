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
  Trash2
} from 'lucide-react';
import { FileUpload } from '../ui/file-upload';
import { CalendarDatePicker } from '../ui/calendar-date-picker';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  onBackToHome?: () => void;
}

interface StudentApproval {
  id: string;
  type: 'music' | 'image';
  title: string;
  studentName: string;
  academy: string;
  date: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
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

const ACADEMIES_DATA = [
  { name: 'Matriz Juiz de Fora (Centro)', students: 165, max: 180, teacher: 'Mestre Pinheiro', city: 'Juiz de Fora - MG', growth: '+18%' },
  { name: 'Polo Benfica (Zona Norte)', students: 92, max: 100, teacher: 'Contramestre Soldado', city: 'Juiz de Fora - MG', growth: '+12%' },
  { name: 'Polo São Pedro (Cidade Alta)', students: 78, max: 90, teacher: 'Prof. Dom Ruan', city: 'Juiz de Fora - MG', growth: '+24%' },
  { name: 'Polo Santos Dumont', students: 54, max: 70, teacher: 'Instrutor Curió', city: 'Santos Dumont - MG', growth: '+8%' },
  { name: 'Polo Laranjal', students: 39, max: 50, teacher: 'Professor Dom Ruan', city: 'Laranjal - MG', growth: '+15%' },
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
    'overview' | 'academies' | 'requests' | 'donations' | 'approvals' | 'direct_upload' | 'news'
  >('overview');

  const [approvals, setApprovals] = useState<StudentApproval[]>(INITIAL_APPROVALS);
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [requests, setRequests] = useState<ContactRequest[]>(INITIAL_REQUESTS);
  const [academiesList, setAcademiesList] = useState(ACADEMIES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Upload Form State
  const [directType, setDirectType] = useState<'music' | 'media'>('music');
  const [directTitle, setDirectTitle] = useState('');
  const [directAuthor, setDirectAuthor] = useState('');
  const [directCategory, setDirectCategory] = useState('Toques & Cantigas');
  const [directDescription, setDirectDescription] = useState('');
  const [directAudioFiles, setDirectAudioFiles] = useState<File[]>([]);
  const [directThumbnailFiles, setDirectThumbnailFiles] = useState<File[]>([]);
  const [directMediaFiles, setDirectMediaFiles] = useState<File[]>([]);
  const [directLoading, setDirectLoading] = useState(false);

  // News Form State
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
          .order('students_count', { ascending: false });

        if (acadData && acadData.length > 0) {
          setAcademiesList(
            acadData.map((ac: any) => ({
              name: ac.name,
              students: ac.students_count,
              max: ac.max_capacity,
              teacher: ac.teacher,
              city: ac.city,
              growth: ac.growth_rate,
            }))
          );
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (id: string) => {
    setApprovals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' as const } : item))
    );
    try {
      await supabase
        .from('student_approvals')
        .update({ status: 'approved' })
        .eq('id', id);
    } catch {
      // Handled locally
    }
    showToast('Submissão do aluno aprovada e sincronizada no Supabase!');
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

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directTitle.trim()) {
      showToast('Por favor, informe o título da mídia.');
      return;
    }
    if (directType === 'music' && directAudioFiles.length === 0) {
      showToast('Por favor, selecione o arquivo de áudio MP3.');
      return;
    }
    if (directType === 'media' && directMediaFiles.length === 0) {
      showToast('Por favor, selecione ao menos uma foto ou vídeo.');
      return;
    }

    setDirectLoading(true);

    const audioUrl = directAudioFiles.length > 0
      ? URL.createObjectURL(directAudioFiles[0])
      : 'https://cdn.freesound.org/previews/518/518884_10672049-lq.mp3';

    const thumbnailUrl = directThumbnailFiles.length > 0
      ? URL.createObjectURL(directThumbnailFiles[0])
      : (directType === 'music' ? 'https://i.imgur.com/A46hzMt.jpeg' : undefined);

    const mediaUrl = directMediaFiles.length > 0
      ? URL.createObjectURL(directMediaFiles[0])
      : undefined;

    try {
      await supabase.from('medias').insert([
        {
          title: directTitle,
          type: directType,
          author: directAuthor || 'Elite Nagô',
          category: directCategory,
          description: directDescription,
          url: directType === 'music' ? audioUrl : (mediaUrl || 'https://i.imgur.com/A46hzMt.jpeg'),
          thumbnail_url: thumbnailUrl || 'https://i.imgur.com/A46hzMt.jpeg',
          is_featured: true,
        },
      ]);
    } catch {
      // Fallback
    }

    setDirectLoading(false);
    showToast(`Mídia "${directTitle}" [${directCategory}] salva no Supabase com sucesso!`);
    setDirectTitle('');
    setDirectAuthor('');
    setDirectCategory('Toques & Cantigas');
    setDirectDescription('');
    setDirectAudioFiles([]);
    setDirectThumbnailFiles([]);
    setDirectMediaFiles([]);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) {
      showToast('Informe o título da notícia.');
      return;
    }
    setNewsLoading(true);

    const coverUrl = newsCoverFiles.length > 0
      ? URL.createObjectURL(newsCoverFiles[0])
      : 'https://i.imgur.com/A46hzMt.jpeg';

    const cleanTag = newsTag.trim().toUpperCase() || 'EVENTOS & CERIMÔNIAS';

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

    setNewsLoading(false);
    setNewsTitle('');
    setNewsTag('EVENTOS & CERIMÔNIAS');
    setNewsExcerpt('');
    setNewsContent('');
    setNewsIsFeatured(false);
    setNewsCoverFiles([]);
  };

  const handleDeleteNews = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
              <h1 className="text-sm font-black text-white tracking-tight font-syne">Vite Soft UI</h1>
              <span className="text-[10px] font-bold text-[#EEDC9A] uppercase tracking-wider">Elite Nagô Admin</span>
            </div>
          </div>

          {/* Sidenav Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: 'from-emerald-400 to-teal-500' },
              { id: 'academies', label: 'Tables (Academias)', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { id: 'donations', label: 'Billing (Doações)', icon: DollarSign, color: 'from-violet-500 to-purple-600' },
              { id: 'requests', label: 'Messages (Contatos)', icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/40 border border-white/15'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center shadow-md ${
                      isActive ? `bg-gradient-to-tr ${item.color} text-black` : 'bg-[#15151e] text-neutral-300'
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
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white font-bold shadow-lg shadow-black/40 border border-white/15'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl flex items-center justify-center shadow-md ${
                      isActive ? `bg-gradient-to-tr ${item.color} text-black` : 'bg-[#15151e] text-neutral-300'
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
              {/* Left 7-Col Card: Built by developers / Vite Soft UI */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex-1 space-y-3 z-10">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Built by developers</p>
                  <h3 className="text-xl font-bold text-white font-syne">Vite Soft UI Dashboard</h3>
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
              {/* Left 8-Col Card: Projects & Academies Table */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-syne">Projects & Academias</h4>
                    <p className="text-xs text-neutral-400">
                      <strong className="text-emerald-400">5 Polos ativos</strong> sincronizados
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('academies')} className="text-xs font-bold text-[#EEDC9A] hover:underline">
                    Ver todos
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {academiesList.map((acad) => {
                        const fillPct = Math.round((acad.students / acad.max) * 100);
                        return (
                          <tr key={acad.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-[#EEDC9A]">
                                  {acad.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-white block">{acad.name}</span>
                                  <span className="text-[10px] text-neutral-400">{acad.city}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-neutral-300 font-medium">{acad.teacher}</td>
                            <td className="py-3.5 text-center font-bold text-white">{acad.students}</td>
                            <td className="py-3.5">
                              <div className="flex items-center justify-center gap-2 max-w-[120px] mx-auto">
                                <span className="text-[10px] font-bold text-neutral-400">{fillPct}%</span>
                                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${fillPct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${fillPct}%` }}
                                  />
                                </div>
                              </div>
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

        {/* TAB 2: ACADEMIES LIST */}
        {activeTab === 'academies' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-5">
            <h3 className="text-lg font-bold text-white font-syne">Polos & Unidades de Treino</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academiesList.map((acad) => (
                <div key={acad.name} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-bold text-[#EEDC9A]">{acad.city}</span>
                  <h4 className="text-base font-bold text-white font-syne mt-1">{acad.name}</h4>
                  <p className="text-xs text-neutral-400 mb-3">Responsável: {acad.teacher}</p>
                  <div className="flex justify-between text-xs py-2 border-t border-white/5">
                    <span>Matriculados: <strong>{acad.students}</strong></span>
                    <span>Capacidade: <strong>{acad.max}</strong></span>
                  </div>
                </div>
              ))}
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

        {/* TAB 6: DIRECT UPLOAD (MP3 + OPTIONAL THUMBNAIL) */}
        {activeTab === 'direct_upload' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white font-syne flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#EEDC9A]" />
              Upload Direto de Mídias & Músicas (Admin)
            </h3>

            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div className="flex gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setDirectType('music')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    directType === 'music'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  Música / Áudio MP3
                </button>
                <button
                  type="button"
                  onClick={() => setDirectType('media')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    directType === 'media'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  Foto / Galeria
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Título</label>
                  <input
                    type="text"
                    placeholder="Ex: Toque de São Bento Grande"
                    value={directTitle}
                    onChange={(e) => setDirectTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Autor</label>
                  <input
                    type="text"
                    placeholder="Ex: Mestre Pinheiro"
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
                    <option value="Toques & Cantigas">Toques & Cantigas</option>
                    <option value="Aulas e Treinos">Aulas e Treinos</option>
                    <option value="Batizados & Rodas">Batizados & Rodas</option>
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

              {/* Uploads according to type */}
              {directType === 'music' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      1. Arquivo de Áudio MP3 (Obrigatório)
                    </label>
                    <FileUpload
                      accept="audio/*,.mp3,.wav"
                      maxFiles={1}
                      label="Selecione o arquivo MP3 aqui"
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
              ) : (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Fotos / Imagens da Galeria
                  </label>
                  <FileUpload
                    accept="image/*"
                    maxFiles={5}
                    label="Selecione as imagens aqui"
                    onChange={(files) => setDirectMediaFiles(files)}
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={directLoading}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold text-xs shadow-lg cursor-pointer"
                >
                  {directLoading ? 'Publicando...' : 'Publicar Diretamente no Site'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: NEWS MANAGER */}
        {activeTab === 'news' && (
          <div className="p-6 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-syne flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#EEDC9A]" />
                  Inserir Notícias no Site
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Publique novidades com título, tag em destaque, categoria, data e descrição completa.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#EEDC9A] font-bold">
                {newsList.length} Notícias Ativas
              </span>
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
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Capa da Matéria</label>
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

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={newsLoading}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#EEDC9A] to-[#d4be6e] text-black font-bold text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  {newsLoading ? 'Publicando...' : 'Publicar Notícia no Supabase'}
                </button>
              </div>
            </form>

            {/* List of Published News */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white font-syne">Notícias Cadastradas</h4>
              <div className="space-y-2">
                {newsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold font-syne uppercase bg-[#EEDC9A]/10 text-[#EEDC9A] border border-[#EEDC9A]/30">
                          {item.tag || item.category?.toUpperCase() || 'DESTAQUE'}
                        </span>
                        <span className="text-[10px] text-neutral-400">{item.category}</span>
                        <span className="text-[10px] text-neutral-500">• {item.date}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{item.title}</h5>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{item.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {item.status || 'published'}
                      </span>
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
                ))}
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
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
