import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    console.error('Attendance GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: sessionId } = params
    const body = await request.json()
    const { sailor_id, present, absence_reason, reason } = body
    const resolvedAbsenceReason = absence_reason ?? reason ?? null

    if (!sailor_id) {
      return Response.json(
        { error: 'מזהה חניך נדרש' },
        { status: 400 }
      )
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId)
      .eq('sailor_id', sailor_id)
      .single()

    let result

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('attendance')
        .update({
          present,
          absence_reason: resolvedAbsenceReason,
        })
        .eq('session_id', sessionId)
        .eq('sailor_id', sailor_id)
        .select()

      if (error) throw error
      result = data[0]
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          session_id: sessionId,
          sailor_id,
          present,
          absence_reason: resolvedAbsenceReason,
        }])
        .select()

      if (error) throw error
      result = data[0]
    }

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Attendance POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
