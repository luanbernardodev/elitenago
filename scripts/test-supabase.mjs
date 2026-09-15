import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqiybmjywalhtwwvztgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXlibWp5d2FsaHR3d3Z6dGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjQwNjMsImV4cCI6MjEwNDc0MDA2M30.OK03eEYPdm-466k_IZ8wZL5zRMXxk6BkkwXB3Lpye7Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', supabaseUrl);
  
  try {
    const { data, error, status } = await supabase.from('academies').select('*').limit(5);
    console.log('HTTP Status Code:', status);
    if (error) {
      console.log('Supabase Response Message:', error.message);
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('STATUS: AUTHENTICATED & CONNECTED. The database tables need to be created by executing the migration in SQL Editor.');
      }
    } else {
      console.log('STATUS: SUCCESS! Found', data.length, 'records in academies table:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
