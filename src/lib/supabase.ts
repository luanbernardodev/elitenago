import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mqiybmjywalhtwwvztgh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXlibWp5d2FsaHR3d3Z6dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjQwNjMsImV4cCI6MjEwNDc0MDA2M30.OK03eEYPdm-466k_IZ8wZL5zRMXxk6BkkwXB3Lpye7Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface DatabaseNews {
  id: string;
  title: string;
  tag: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  content?: string | null;
  image: string;
  is_featured?: boolean;
  status: 'published' | 'draft';
  created_at?: string;
}

export interface DatabaseApproval {
  id: string;
  type: 'music' | 'image' | 'video' | 'media';
  title: string;
  student_name: string;
  academy: string;
  date: string;
  audio_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  spotify_url?: string | null;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  file_size?: string | null;
  file_type?: string | null;
  original_filename?: string | null;
  created_at?: string;
}

export interface DatabaseContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'answered' | 'archived';
  created_at?: string;
}

export interface DatabaseMedia {
  id: string;
  title: string;
  type: 'music' | 'media' | 'image' | 'video';
  author: string;
  category: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  spotify_url?: string | null;
  status?: 'approved' | 'pending' | 'rejected';
  file_size?: string | null;
  file_type?: 'photo' | 'video' | 'audio' | string | null;
  original_filename?: string | null;
  downloads_count?: number;
  is_featured?: boolean;
  created_at?: string;
}

export interface DatabaseAcademy {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  responsible: string;
  teacher?: string;
  days: string;
  hours: string;
  whatsapp?: string;
  maps_url?: string;
  embed_query?: string;
  students_count?: number;
  max_capacity?: number;
  growth_rate?: string;
  created_at?: string;
}

export interface DatabaseSponsor {
  id: string;
  name: string;
  alt: string;
  logo_url: string;
  website_url?: string | null;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function uploadToStorage(file: File, folder = 'uploads'): Promise<{ url: string; fileName: string; size: string } | null> {
  try {
    const ext = file.name.split('.').pop() || 'bin';
    const cleanFileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('medias')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload warning:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('medias')
      .getPublicUrl(cleanFileName);

    return {
      url: publicUrlData.publicUrl,
      fileName: file.name,
      size: formatFileSize(file.size),
    };
  } catch (err) {
    console.warn('Storage upload error:', err);
    return null;
  }
}

export async function triggerFileDownload(fileUrl: string, fileName?: string, mediaId?: string): Promise<boolean> {
  try {
    if (mediaId) {
      // Increment downloads_count in background
      supabase.rpc('increment_media_download', { media_id: mediaId }).then(({ error }) => {
        if (error) {
          // Fallback direct update
          supabase.from('medias').select('downloads_count').eq('id', mediaId).single().then(({ data }) => {
            const current = (data?.downloads_count || 0) + 1;
            supabase.from('medias').update({ downloads_count: current }).eq('id', mediaId);
          });
        }
      });
    }

    const response = await fetch(fileUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || fileUrl.split('/').pop() || 'elite-nago-arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch {
    // Fallback: direct browser download link
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'elite-nago-arquivo';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
}

export async function fetchSpotifyMetadata(spotifyUrl: string): Promise<{ title?: string; author?: string; thumbnail_url?: string } | null> {
  try {
    if (!spotifyUrl || !spotifyUrl.includes('spotify.com')) return null;
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnail_url: data.thumbnail_url,
      };
    }
  } catch (err) {
    console.warn('Could not fetch Spotify oEmbed:', err);
  }
  return null;
}


