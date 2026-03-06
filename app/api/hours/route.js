import { supabase } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const coachId = searchParams.get('coach_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let query = supabase.from('work_hours').select('*')

    if (coachId) query = query.eq('coach_id', coachId)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, error } = await query.order('date', { ascending: false })

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    console.error('Hours GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { coach_id, date, start_time, end_time, notes } = body

    if (!coach_id || !date || !start_time || !end_time) {
      return Response.json(
        { error: 'מדריך, תאריך, שעת התחלה וסיום נדרשים' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('work_hours')
      .insert([{
        coach_id,
        date,
        start_time,
        end_time,
        notes: notes || '',
      }])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Hours POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
