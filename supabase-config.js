/**
 * LuxeCraft Studio - Supabase Cloud Database & Authentication Configuration
 * 
 * 1. Sign up for free at https://supabase.com
 * 2. Create a new project (takes ~1 minute)
 * 3. Go to Project Settings -> API and copy your:
 *    - Project URL
 *    - Project API Key (anon / public)
 * 4. Paste them below or save them directly in the Seller Studio!
 */

const SUPABASE_CONFIG = {
  url: window.localStorage.getItem('luxecraft_supabase_url') || "https://adinbayfyrhxwtgqmjpl.supabase.co",
  anonKey: window.localStorage.getItem('luxecraft_supabase_key') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaW5iYXlmeXJoeHd0Z3FtanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Nzc5NzksImV4cCI6MjEwNTI1Mzk3OX0.-Vi8fayviQvwWx6cKVSQ_XlH5zGXx94zn5tU5VyXwDM"
};

// Ensure valid credentials even if localStorage contains empty string
if (!SUPABASE_CONFIG.url) {
  SUPABASE_CONFIG.url = "https://adinbayfyrhxwtgqmjpl.supabase.co";
}
if (!SUPABASE_CONFIG.anonKey) {
  SUPABASE_CONFIG.anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaW5iYXlmeXJoeHd0Z3FtanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Nzc5NzksImV4cCI6MjEwNTI1Mzk3OX0.-Vi8fayviQvwWx6cKVSQ_XlH5zGXx94zn5tU5VyXwDM";
}

let supabaseClient = null;

function initSupabaseClient() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('✨ Connected to Supabase Cloud Database & Auth!');
      return true;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return false;
    }
  }
  return false;
}

function isDbConnected() {
  return !!supabaseClient;
}

function saveSupabaseCredentials(url, key) {
  if (!url || !key) return false;
  SUPABASE_CONFIG.url = url.trim();
  SUPABASE_CONFIG.anonKey = key.trim();
  localStorage.setItem('luxecraft_supabase_url', SUPABASE_CONFIG.url);
  localStorage.setItem('luxecraft_supabase_key', SUPABASE_CONFIG.anonKey);
  return initSupabaseClient();
}
