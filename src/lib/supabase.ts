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
  type: 'music' | 'image';
  title: string;
  student_name: string;
  academy: string;
  date: string;
  audio_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
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
  type: 'music' | 'media';
  author: string;
  category: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  created_at?: string;
}
