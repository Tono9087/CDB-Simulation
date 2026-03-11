import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env manually
const env = readFileSync('.env', 'utf8');
const vars = Object.fromEntries(
  env.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
);

const SUPABASE_URL = vars['SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];

console.log('🔗 URL:', SUPABASE_URL);
console.log('🔑 Key:', SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Test: count rows in victims table
const { data, error, count } = await supabase
  .from('victims')
  .select('*', { count: 'exact', head: true });

if (error) {
  console.error('❌ Error:', error.message);
  console.error('   Hint:', error.hint || error.details || '');
} else {
  console.log(`✅ Conexión exitosa! Tabla "victims" tiene ${count} registros.`);
}
