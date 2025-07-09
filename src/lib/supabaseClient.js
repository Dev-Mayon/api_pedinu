import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsrhzvuwndagyqxilaej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcmh6dnV3bmRhZ3lxeGlsYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjI1MDIsImV4cCI6MjA2NTU5ODUwMn0.1ApiiemxRuNhoKftypI-PlpDtyW3NZxTwgwshHnTy-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Error removing from localStorage:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'pedinu-app'
    }
  }
});

export const clearCorruptedSession = async () => {
  try {
    const keys = ['sb-rsrhzvuwndagyqxilaej-auth-token', 'supabase.auth.token'];
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing ${key}:`, error);
      }
    });
    
    await supabase.auth.signOut({ scope: 'local' });
    
    console.log('Sessão corrompida limpa com sucesso');
  } catch (error) {
    console.warn('Erro ao limpar sessão corrompida:', error);
  }
};

export const recoverSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao recuperar sessão:', error);
      
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('Invalid Refresh Token')) {
        await clearCorruptedSession();
        return null;
      }
      
      throw error;
    }
    
    return session;
  } catch (error) {
    console.error('Erro crítico ao recuperar sessão:', error);
    await clearCorruptedSession();
    return null;
  }
};

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});