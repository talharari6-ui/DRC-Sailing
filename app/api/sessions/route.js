import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('group_id')
    const coachId = searchParams.get('coach_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    const includeDetails = searchParams.get('include_details') === 'true'

    let selectFields = '*'
    if (includeDetails) {
      selectFields = `
        *,
        groups(id, name, color),
        coaches(name),
        attendance(sailor_id, present, absence_reason)
      `
    }

    let query = supabase.from('sessions').select(selectFields)

    if (groupId) query = query.eq('group_id', groupId)
    if (coachId) query = query.eq('coach_id', coachId)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, error } = await query.order('date', { ascending: false })

    if (error) throw error
    return Response.json(data || [])
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
        { error: 'קבוצה, תאריך ומדריך נדרשים' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        group_id,
        date,
        coach_id,
        cancelled: false,
        admin_approved: true,
      }])
      .select('*')

    if (error) throw error
    const session = data && data[0]
    return Response.json({
      id: session?.id,
      group_id: session?.group_id,
      date: session?.date,
      coach_id: session?.coach_id,
      start_time: session?.start_time,
      end_time: session?.end_time,
      cancelled: session?.cancelled,
      admin_approved: session?.admin_approved,
      attendance: [],
    }, { status: 201 })
  } catch (error) {
    console.error('Sessions POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
