import { supabase } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
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
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('groups')
      .update(body)
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
    const { id } = params

    // Delete from group_sailors first
    await supabase.from('group_sailors').delete().eq('group_id', id)

    // Then delete group
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
