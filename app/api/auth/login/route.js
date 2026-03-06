import { getSupabaseClient } from '@/src/lib/supabase'

export async function POST(request) {
  try {
    const { login_code } = await request.json()

    // Validate input
    if (!login_code || typeof login_code !== 'string') {
      return Response.json(
        { error: 'קוד כניסה נדרש' },
        { status: 400 }
      )
    }

    // Query Supabase for coach
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('login_code', login_code.trim())
      .single()

    // Handle errors
    if (error) {
      if (error.code === 'PGRST116') {
        // No matching row
        return Response.json(
          { error: 'קוד כניסה לא חוקי' },
          { status: 401 }
        )
      }
      throw error
    }

    if (!data) {
      return Response.json(
        { error: 'קוד כניסה לא חוקי' },
        { status: 401 }
      )
    }

    // Return coach data
    return Response.json({
      id: data.id,
      name: data.name,
      email: data.email || '',
      is_admin: data.is_admin || false,
      avatar_url: data.avatar_url || '',
      created_at: data.created_at,
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'שגיאה בהתחברות' },
      { status: 500 }
    )
  }
}
