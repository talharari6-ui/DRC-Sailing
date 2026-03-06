import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params

    // Get all coaches that can be substitutes
    const { data, error } = await supabase
      .from('coaches')
      .select('id, name, email')
      .order('name')

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    console.error('Substitute coaches GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params
    const { coach_id } = await request.json()

    if (!coach_id) {
      return Response.json(
        { error: 'מדריך נדרש' },
        { status: 400 }
      )
    }

    // Update session with substitute coach
    const { data, error } = await supabase
      .from('sessions')
      .update({ substitute_coach_id: coach_id })
      .eq('id', sessionId)
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 200 })
  } catch (error) {
    console.error('Substitute coach POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
