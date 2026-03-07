import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('group_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const adminApproved = searchParams.get('admin_approved')
    const includeDetails = searchParams.get('include_details') === 'true'

    const buildQuery = (fields) => {
      let query = supabase.from('sessions').select(fields)
      if (groupId) query = query.eq('group_id', groupId)
      if (dateFrom) query = query.gte('date', dateFrom)
      if (dateTo) query = query.lte('date', dateTo)
      if (adminApproved === 'true') query = query.eq('admin_approved', true)
      if (adminApproved === 'false') query = query.eq('admin_approved', false)
      return query.order('date', { ascending: false })
    }

    const selectCandidates = includeDetails
      ? [
          `*,
           groups(id, name, color, coach_id, days_of_week, start_time, end_time, start_date),
           coaches(name, email),
           group_sailors(sailor_id, sailors(id, name, level))`,
          `*,
           groups(id, name, color, coach_id, days_of_week, start_time, end_time, start_date),
           coaches(name, email)`,
          `*,
           groups(id, name, color, coach_id, days_of_week, start_time, end_time, start_date)`,
          '*',
        ]
      : ['*']

    let lastError = null
    for (const fields of selectCandidates) {
      const { data, error } = await buildQuery(fields)
      if (!error) {
        return Response.json(data || [])
      }
      lastError = error
    }

    throw lastError || new Error('Failed to load sessions')
  } catch (error) {
    console.error('Sessions GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { group_id, date, coach_id } = body

    if (!group_id || !date || !coach_id) {
      return Response.json(
        { error: 'Group, date and coach are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          group_id,
          date,
          coach_id,
          cancelled: false,
          admin_approved: true,
        },
      ])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Sessions POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
