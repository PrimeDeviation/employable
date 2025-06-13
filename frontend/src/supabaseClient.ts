import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvtqkvifglyytdsvsyzo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dHFrdmlmZ2x5eXRkc3ZzeXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTI4MDAsImV4cCI6MjA2NTQyODgwMH0.CUS5rQauFXHXTXBJGMxGWES9d8G7LmbaX0vlWMs2DOw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 