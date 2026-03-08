import { getSupabaseClient } from '@/src/lib/supabase'

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { coach_id, date, start_time, end_time, notes, change_note } = body

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
        change_note: change_note || '',
      }])
      .select()

    if (error) throw error
    return Response.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Hours POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    if (Array.isArray(body.batch)) {
      const batch = body.batch.filter(
        (item) => item?.coach_id && item?.date && item?.start_time && item?.end_time
      )
      if (batch.length === 0) {
        return Response.json({ error: 'No valid batch records provided' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('work_hours')
        .upsert(
          batch.map((item) => ({
            coach_id: item.coach_id,
            date: item.date,
            start_time: item.start_time,
            end_time: item.end_time,
            notes: item.notes || '',
            change_note: item.change_note || '',
          })),
          { onConflict: 'coach_id,date' }
        )
        .select()

      if (error) throw error
      return Response.json(data || [])
    }

    const { coach_id, date, start_time, end_time, notes, change_note } = body
    if (!coach_id || !date || !start_time || !end_time) {
      return Response.json(
        { error: 'מדריך, תאריך, שעת התחלה וסיום נדרשים' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('work_hours')
      .upsert(
        [{
          coach_id,
          date,
          start_time,
          end_time,
          notes: notes || '',
          change_note: change_note || '',
        }],
        { onConflict: 'coach_id,date' }
      )
      .select()

    if (error) throw error
    return Response.json(data?.[0] || null)
  } catch (error) {
    console.error('Hours PUT error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { coach_id, date } = body

    if (!coach_id || !date) {
      return Response.json({ error: 'coach_id and date are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('work_hours')
      .delete()
      .eq('coach_id', coach_id)
      .eq('date', date)

    if (error) throw error
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Hours DELETE error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
