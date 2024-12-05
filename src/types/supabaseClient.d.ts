// src/types/supabaseClient.d.ts
import { SupabaseClient } from '@supabase/supabase-js';

declare module './utils/supabaseClient' {
  export const supabase: SupabaseClient;
}