import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) as any;

// Tenant context from environment (set per-deployment via .env.{slug})
export const TENANT_ID = import.meta.env.VITE_TENANT_ID as string | undefined;
export const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG as string | undefined;
export const IS_PLATFORM = import.meta.env.VITE_IS_PLATFORM === 'true';


