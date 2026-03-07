import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error) {
    console.error('Groups GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params
    const body = await request.json()

    const allowed = {
      name: body.name,
      color: body.color,
      days_of_week: body.days_of_week,
      start_time: body.start_time,
      end_time: body.end_time,
      start_date: body.start_date,
    }

    const updates = Object.fromEntries(
      Object.entries(allowed).filter(([, value]) => value !== undefined)
    )

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return Response.json(data[0])
  } catch (error) {
    console.error('Groups PATCH error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    await supabase.from('group_sailors').delete().eq('group_id', id)

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Groups DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
