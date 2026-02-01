import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please create a .env file with your Supabase project URL. ' +
    'See SUPABASE_CREDENTIALS.md for instructions.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please create a .env file with your Supabase anon key. ' +
    'See SUPABASE_CREDENTIALS.md for instructions.'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(
    `Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". ` +
    'It must be a valid HTTP or HTTPS URL (e.g., https://xxxxx.supabase.co). ' +
    'Make sure there are no extra spaces or quotes in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
