import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mrehomunxqccvcwpkwxd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_o_zU6hleiM1JacijRPTTRA_aIJI7k_9';

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
