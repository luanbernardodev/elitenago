import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqiybmjywalhtwwvztgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXlibWp5d2FsaHR3d3Z6dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjQwNjMsImV4cCI6MjEwNDc0MDA2M30.OK03eEYPdm-466k_IZ8wZL5zRMXxk6BkkwXB3Lpye7Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAcademy() {
  console.log('Atualizando academia de Matias Barbosa para Laranjal - MG no Supabase...');
  
  const { data, error } = await supabase
    .from('academies')
    .update({
      name: 'Polo Laranjal',
      city: 'Laranjal - MG',
      teacher: 'Professor Dom Ruan',
    })
    .eq('id', '249d908e-0600-4882-8d44-0bba8d26b7db')
    .select();

  if (error) {
    console.error('Erro ao atualizar:', error);
  } else {
    console.log('✅ Sucesso! Registro atualizado no Supabase:', data);
  }

  // List all current academies to confirm
  const { data: all } = await supabase.from('academies').select('*');
  console.log('Lista atualizada de todas as academias no Supabase:');
  console.table(all);
}

updateAcademy();
