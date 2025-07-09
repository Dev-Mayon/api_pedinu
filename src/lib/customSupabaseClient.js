import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente do Supabase devem ser configuradas no Vercel.
// Use os nomes VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação opcional para ajudar na depuração durante o desenvolvimento.
// Em produção, espera-se que essas variáveis estejam sempre definidas.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: Variáveis de ambiente do Supabase não configuradas! Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.");
  // Considere adicionar um tratamento de erro mais robusto aqui se for crítico para o carregamento do app.
  // Por exemplo, você pode redirecionar para uma página de erro ou exibir uma mensagem amigável.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);