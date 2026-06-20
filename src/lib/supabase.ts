import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || "https://vijdmhwulqfncqmamdbu.supabase.co";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_RR0oruXWfMrcTenlbOdhXg_jKK4VtqQ";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Guard client initialization to avoid throwing errors during initial setup
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
