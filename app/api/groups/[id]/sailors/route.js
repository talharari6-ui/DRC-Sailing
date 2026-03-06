import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id: groupId } = params

    // Get sailors in this group via group_sailors junction table
    const { data, error } = await supabase
      .from('group_sailors')
      .select('sailor_id, sailors(id, name, age, level)')
      .eq('group_id', groupId)
      .order('sailors(name)')

    if (error) throw error

    // Flatten the response
    const sailors = data.map(row => ({
      id: row.sailor_id,
      ...row.sailors[0]
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
      const { data: newSailor, error: createError } = await supabase
        .from('sailors')
        .insert([{
          name: new_sailor.name,
          age: new_sailor.age,
          level: new_sailor.level || 'beginner'
        }])
        .select()

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
