import { createClient } from '@supabase/supabase-js';

// Astro usa import.meta.env para leer el archivo .env
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);