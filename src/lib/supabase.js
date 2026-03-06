import { createClient } from '@supabase/supabase-js'

let supabase = null

export function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables')
    }

    supabase = createClient(supabaseUrl, supabaseKey)
  }

  return supabase
}
