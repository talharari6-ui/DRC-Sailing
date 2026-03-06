import { supabase } from '@/src/lib/supabase'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('coaches')
      .update(body)
      .eq('id', id)
      .select()

    if (error) throw error
    return Response.json(data[0])
  } catch (error) {
    console.error('Coaches PATCH error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Coaches DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
