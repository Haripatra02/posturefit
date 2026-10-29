import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  if (config.nodeEnv === 'test') {
    return false;
  }
  return Boolean(
    config.supabaseUrl &&
    config.supabaseUrl.startsWith('http') &&
    (config.supabaseServiceRoleKey || config.supabaseAnonKey)
  );
};

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    supabaseClient = createClient(config.supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
};
