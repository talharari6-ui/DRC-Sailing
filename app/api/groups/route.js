import { supabase } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const coachId = searchParams.get('coach_id')

    let query = supabase.from('groups').select('*')

    if (coachId) {
      query = query.eq('coach_id', coachId)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return Response.json(data || [])
  } catch (error) {
    console.error('Groups GET error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, coach_id, color, days_of_week, start_time, end_time, start_date } = body

    if (!name || !coach_id) {
      return Response.json(
        { error: 'שם קבוצה ומדריך נדרשים' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name,
        coach_id,
        color: color || '#3b82f6',
        days_of_week: days_of_week || [],
        start_time: start_time || '',
        end_time: end_time || '',
        start_date: start_date || null,
      }])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Groups POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
