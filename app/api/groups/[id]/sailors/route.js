import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: groupId } = params

    // Get sailors in this group via group_sailors junction table
    const { data, error } = await supabase
      .from('group_sailors')
      .select('sailor_id, sailors(id, first_name, last_name, gender, boat, birth_date, join_date, shirt_size, parent_name, parent_phone)')
      .eq('group_id', groupId)

    if (error) throw error

    // Flatten the response
    const sailors = data.map(row => ({
      id: row.sailor_id,
      ...(Array.isArray(row.sailors) ? row.sailors[0] : row.sailors)
    }))

    return Response.json(sailors)
  } catch (error) {
    console.error('Group sailors GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: groupId } = params
    const { sailor_id, new_sailor } = await request.json()

    let sailorToAddId = sailor_id

    // If new sailor, create it first
    if (new_sailor && !sailor_id) {
      const sailorPayload = {
        first_name: new_sailor.first_name || '',
        last_name: new_sailor.last_name || '',
        birth_date: new_sailor.birth_date || null,
        parent_name: new_sailor.parent_name || '',
        parent_phone: new_sailor.parent_phone || '',
        shirt_size: new_sailor.shirt_size || '',
        gender: new_sailor.gender || '',
        boat: new_sailor.boat || '',
        join_date: new_sailor.join_date || null,
      }

      let newSailor = null
      let createError = null
      const createRes = await supabase.from('sailors').insert([sailorPayload]).select()
      newSailor = createRes.data
      createError = createRes.error
      if (createError && `${createError.message || ''}`.toLowerCase().includes('join_date')) {
        const fallbackPayload = { ...sailorPayload }
        delete fallbackPayload.join_date
        const fallbackRes = await supabase.from('sailors').insert([fallbackPayload]).select()
        newSailor = fallbackRes.data
        createError = fallbackRes.error
      }

      if (createError) throw createError
      sailorToAddId = newSailor[0].id
    }

    // Add sailor to group
    const { data, error } = await supabase
      .from('group_sailors')
      .insert([{
        group_id: groupId,
        sailor_id: sailorToAddId
      }])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Group sailor POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: groupId } = params
    const { searchParams } = new URL(request.url)
    const sailorId = searchParams.get('sailor_id')

    if (!sailorId) {
      return Response.json(
        { error: 'sailor_id נדרש' },
        { status: 400 }
      )
    }

    // Remove sailor from group
    const { error } = await supabase
      .from('group_sailors')
      .delete()
      .eq('group_id', groupId)
      .eq('sailor_id', sailorId)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Group sailor DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
