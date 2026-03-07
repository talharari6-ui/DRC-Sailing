import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('coaches')
      .select('id, name')
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
    const { coach_id, requester_id, requester_is_admin } = await request.json()

    if (!coach_id || !requester_id) {
      return Response.json(
        { error: 'Substitute coach and requester are required' },
        { status: 400 }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, cancelled, admin_approved, substitute_coach_id, groups(coach_id)')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw sessionError

    const groupCoachId = session?.groups?.coach_id
    const isGroupCoach = groupCoachId && groupCoachId === requester_id
    const isAdmin = requester_is_admin === true
    const canAssignDirectly = isAdmin || isGroupCoach
    const isOpenForSubstitute =
      session?.admin_approved === false &&
      session?.cancelled === false &&
      !session?.substitute_coach_id

    if (!canAssignDirectly && !isOpenForSubstitute) {
      return Response.json(
        { error: 'This session is not open for substitute requests.' },
        { status: 403 }
      )
    }

    const updates = {
      substitute_coach_id: coach_id,
      admin_approved: canAssignDirectly ? true : false,
    }

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()

    if (error) throw error

    return Response.json({
      session: data?.[0] || null,
      pending_approval: !canAssignDirectly,
    })
  } catch (error) {
    console.error('Substitute coach POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
