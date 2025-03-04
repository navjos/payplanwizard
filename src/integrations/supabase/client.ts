
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tcojctzbcjbmpbcnqles.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb2pjdHpiY2pibXBiY25xbGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDA4MzAsImV4cCI6MjA1NjY3NjgzMH0.iXyQEDDGJsfNDilnWIYbfKAvcAetjsS4Tqtf6xbaSHc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
