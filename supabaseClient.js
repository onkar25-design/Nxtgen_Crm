import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcbfakihhtnxwksikzsq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jYmZha2loaHRueHdrc2lrenNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyODUyODUsImV4cCI6MjA0Mzg2MTI4NX0.tJiM9forLFNMCPn3WDcsfXG2tfFlTsZcASoGG2TsuEM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
