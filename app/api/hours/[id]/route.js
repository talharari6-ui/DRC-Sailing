import { getSupabaseClient } from '@/src/lib/supabase'

export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params
    const body = await request.json()
    const { start_time, end_time, notes } = body

    if (!start_time || !end_time) {
      return Response.json(
        { error: 'שעת התחלה ושעת סיום נדרשות' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('work_hours')
      .update({
        start_time,
        end_time,
        notes: notes || '',
      })
      .eq('id', id)
      .select()

    if (error) throw error
    return Response.json(data?.[0] || null)
  } catch (error) {
    console.error('Hours PATCH error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    const { error } = await supabase
      .from('work_hours')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Hours DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
