import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
