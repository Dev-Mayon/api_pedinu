import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsrhzvuwndagyqxilaej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcmh6dnV3bmRhZ3lxeGlsYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjI1MDIsImV4cCI6MjA2NTU5ODUwMn0.1ApiiemxRuNhoKftypI-PlpDtyW3NZxTwgwshHnTy-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);