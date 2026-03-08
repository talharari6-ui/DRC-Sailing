import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params

    // Get session with related data
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        groups(name, color),
        coaches(name),
        attendance(sailor_id, present, absence_reason)
      `)
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error) {
    console.error('Session GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params
    const updates = await request.json()

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()

    if (error) throw error
    return Response.json(data[0])
  } catch (error) {
    console.error('Session PATCH error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params

    // Delete session
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Session DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
