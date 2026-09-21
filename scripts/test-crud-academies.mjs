import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqiybmjywalhtwwvztgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXlibWp5d2FsaHR3d3Z6dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjQwNjMsImV4cCI6MjEwNDc0MDA2M30.OK03eEYPdm-466k_IZ8wZL5zRMXxk6BkkwXB3Lpye7Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCrud() {
  console.log('--- TESTANDO LEITURA DAS ACADEMIAS ---');
  const { data: list, error: listError } = await supabase.from('academies').select('*');
  if (listError) {
    console.error('Erro na leitura:', listError);
    return;
  }
  console.log(`✅ Sucesso! Encontrados ${list.length} registros:`);
  console.table(list.map(a => ({
    id: a.id.slice(0, 8),
    city: a.city,
    neighborhood: a.neighborhood,
    address: a.address,
    responsible: a.responsible,
    days: a.days,
    hours: a.hours,
    maps: a.maps_url ? 'OK' : 'Vazio'
  })));

  console.log('\n--- TESTANDO INSERÇÃO ---');
  const testItem = {
    name: 'Polo Teste Automatizado',
    city: 'Juiz de Fora - MG',
    neighborhood: 'Manoel Honório',
    address: 'Av. Rio Branco, 4000 - Centro de Treinamento',
    responsible: 'Mestre Teste',
    teacher: 'Mestre Teste',
    days: 'Terça e Quinta',
    hours: '19:00 às 20:30',
    maps_url: 'https://maps.app.goo.gl/test',
    embed_query: 'Av. Rio Branco, 4000, Juiz de Fora - MG',
    whatsapp: '5532999999999',
    students_count: 25,
    max_capacity: 50
  };

  const { data: inserted, error: insertError } = await supabase.from('academies').insert([testItem]).select();
  if (insertError) {
    console.error('Erro ao inserir:', insertError);
    return;
  }
  console.log('✅ Inserção concluída! ID criado:', inserted[0].id);

  console.log('\n--- TESTANDO ATUALIZAÇÃO ---');
  const { error: updateError } = await supabase
    .from('academies')
    .update({ responsible: 'Mestre Teste Atualizado', hours: '20:00 às 21:30' })
    .eq('id', inserted[0].id);
  if (updateError) {
    console.error('Erro ao atualizar:', updateError);
    return;
  }
  console.log('✅ Atualização concluída com sucesso!');

  console.log('\n--- TESTANDO DELEÇÃO ---');
  const { error: deleteError } = await supabase.from('academies').delete().eq('id', inserted[0].id);
  if (deleteError) {
    console.error('Erro ao deletar:', deleteError);
    return;
  }
  console.log('✅ Deleção concluída com sucesso! CRUD 100% funcional no Supabase.');
}

testCrud();
