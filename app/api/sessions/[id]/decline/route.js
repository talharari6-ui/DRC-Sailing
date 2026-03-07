import { getSupabaseClient } from '@/src/lib/supabase'

export async function POST(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params
    const { requester_id, requester_is_admin, reason } = await request.json()

    if (!requester_id) {
      return Response.json({ error: 'Missing requester_id' }, { status: 400 })
    }

    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('id, groups(coach_id)')
      .eq('id', sessionId)
      .single()

    if (fetchError) throw fetchError

    const groupCoachId = session?.groups?.coach_id
    const isGroupCoach = groupCoachId && groupCoachId === requester_id
    const isAdmin = requester_is_admin === true

    if (!isGroupCoach && !isAdmin) {
      return Response.json({ error: 'Not allowed to request decline for this session' }, { status: 403 })
    }

    const updates = {
      cancelled: true,
      cancel_reason: reason?.trim() || null,
      admin_approved: isAdmin ? true : false,
    }

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()

    if (error) throw error

    return Response.json({
      session: data?.[0] || null,
      pending_approval: !isAdmin,
    })
  } catch (error) {
    console.error('Session decline POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
