import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase tables if they don't exist
async function initializeDatabase() {
  const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
  
  if (profilesError?.code === '42P01') {
    await supabase.query(`
      create table if not exists profiles (
        id uuid references auth.users on delete cascade primary key,
        username text unique,
        full_name text,
        email text unique not null,
        phone text,
        address text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `);
  }

  const { error: transactionsError } = await supabase.from('transactions').select('id').limit(1);
  
  if (transactionsError?.code === '42P01') {
    await supabase.query(`
      create table if not exists transactions (
        id bigint generated by default as identity primary key,
        user_id uuid references auth.users on delete cascade not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        description text not null,
        amount decimal(12,2) not null
      );
    `);
  }
}

initializeDatabase().catch(console.error);