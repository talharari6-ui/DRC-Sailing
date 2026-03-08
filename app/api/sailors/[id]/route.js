import { getSupabaseClient } from '@/src/lib/supabase'

export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params
    const body = await request.json()
    let updates = { ...body }

    let { data, error } = await supabase
      .from('sailors')
      .update(updates)
      .eq('id', id)
      .select()

    if (error && `${error.message || ''}`.toLowerCase().includes('join_date')) {
      delete updates.join_date
      const fallback = await supabase
        .from('sailors')
        .update(updates)
        .eq('id', id)
        .select()
      data = fallback.data
      error = fallback.error
    }

    if (error) throw error
    return Response.json(data[0])
  } catch (error) {
    console.error('Sailors PATCH error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params

    // Delete from group_sailors first
    await supabase.from('group_sailors').delete().eq('sailor_id', id)

    // Then delete sailor
    const { error } = await supabase
      .from('sailors')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Sailors DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
