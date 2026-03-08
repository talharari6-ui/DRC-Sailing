import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('group_id')

    let query = supabase.from('sailors').select('*')

    if (groupId) {
      // Get sailors for a specific group
      query = query.in('id',
        supabase
          .from('group_sailors')
          .select('sailor_id')
          .eq('group_id', groupId)
      )
    }

    const { data, error } = await query.order('first_name')

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    console.error('Sailors GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { first_name, last_name, birth_date, join_date, parent_name, parent_phone, shirt_size, gender, boat } = body

    if (!first_name || !last_name) {
      return Response.json(
        { error: 'שם פרטי ומשפחה נדרשים' },
        { status: 400 }
      )
    }

    const sailorPayload = {
      first_name,
      last_name,
      birth_date: birth_date || null,
      join_date: join_date || null,
      parent_name: parent_name || '',
      parent_phone: parent_phone || '',
      shirt_size: shirt_size || '',
      gender: gender || '',
      boat: boat || '',
    }
    let data = null
    let error = null
    const createRes = await supabase.from('sailors').insert([sailorPayload]).select()
    data = createRes.data
    error = createRes.error
    if (error && `${error.message || ''}`.toLowerCase().includes('join_date')) {
      const fallbackPayload = { ...sailorPayload }
      delete fallbackPayload.join_date
      const fallbackRes = await supabase.from('sailors').insert([fallbackPayload]).select()
      data = fallbackRes.data
      error = fallbackRes.error
    }

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Sailors POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
