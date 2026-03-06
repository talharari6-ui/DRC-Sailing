import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const coachId = searchParams.get('id')

    if (coachId) {
      // Get single coach
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', coachId)
        .single()

      if (error) throw error
      return Response.json(data)
    }

    // Get all coaches
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('name')

    if (error) throw error
    return Response.json(data)
  } catch (error) {
    console.error('Coaches GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { name, email, login_code, is_admin } = body

    if (!name || !login_code) {
      return Response.json(
        { error: 'שם וקוד כניסה נדרשים' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('coaches')
      .insert([{ name, email, login_code, is_admin: is_admin || false }])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Coaches POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
