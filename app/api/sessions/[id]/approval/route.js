import { getSupabaseClient } from '@/src/lib/supabase'

export async function POST(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params
    const { action } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('id, cancelled, cancel_reason, substitute_coach_id, admin_approved')
      .eq('id', sessionId)
      .single()

    if (fetchError) throw fetchError

    let updates = {}
    if (action === 'approve') {
      updates = { admin_approved: true }
    } else {
      const isPendingDecline = session.cancelled === true && session.admin_approved === false
      const isPendingSubstitute = !session.cancelled && !!session.substitute_coach_id && session.admin_approved === false

      if (isPendingDecline) {
        updates = {
          cancelled: false,
          cancel_reason: null,
          admin_approved: true,
        }
      } else if (isPendingSubstitute) {
        updates = {
          substitute_coach_id: null,
          admin_approved: true,
        }
      } else {
        updates = { admin_approved: true }
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()

    if (error) throw error
    return Response.json(data?.[0] || null)
  } catch (error) {
    console.error('Session approval POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
