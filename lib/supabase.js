import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);
export const supabase = hasSupabaseEnv ? createClient(supabaseUrl, supabaseKey) : null;
