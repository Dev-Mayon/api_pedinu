import { createClient } from '@supabase/supabase-js';

// As credenciais do Supabase agora serão lidas das variáveis de ambiente
// Elas devem ser definidas no Vercel (e localmente, se você tiver um arquivo .env.local)
// com os nomes VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis foram carregadas corretamente
// (Isso é bom para depuração local, mas remova em produção se não for necessário)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas corretamente.');
  // Você pode lançar um erro ou lidar com isso de outra forma
  // throw new Error('Credenciais do Supabase faltando');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);