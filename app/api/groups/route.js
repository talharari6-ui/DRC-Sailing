import { getSupabaseClient } from '@/src/lib/supabase'

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildPlannedSessions({ groupId, coachId, daysOfWeek, startDate, startTime, endTime }) {
  const sessions = []
  const activeDays = Array.isArray(daysOfWeek) ? daysOfWeek : []
  if (!groupId || !coachId || activeDays.length === 0) return sessions

  const start = startDate ? new Date(`${startDate}T12:00:00`) : new Date()
  const horizon = new Date(start)
  horizon.setDate(horizon.getDate() + 180)

  for (let date = new Date(start); date <= horizon; date.setDate(date.getDate() + 1)) {
    if (!activeDays.includes(date.getDay())) continue
    sessions.push({
      group_id: groupId,
      coach_id: coachId,
      date: toDateKey(date),
      start_time: startTime || null,
      end_time: endTime || null,
      cancelled: false,
      admin_approved: true,
    })
  }

  return sessions
}

export async function GET(request) {
  try {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { name, coach_id, color, days_of_week, start_time, end_time, start_date } = body

    if (!name || !coach_id) {
      return Response.json(
        { error: 'Group name and coach are required' },
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

    const createdGroup = data[0]
    const sessionsToCreate = buildPlannedSessions({
      groupId: createdGroup?.id,
      coachId: coach_id,
      daysOfWeek: days_of_week,
      startDate: start_date,
      startTime: start_time,
      endTime: end_time,
    })

    if (sessionsToCreate.length > 0) {
      const { error: sessionsError } = await supabase
        .from('sessions')
        .insert(sessionsToCreate)

      if (sessionsError) {
        console.error('Groups POST sessions seed error:', sessionsError)
        return Response.json(
          {
            error: `Failed to auto-create sessions: ${sessionsError.message}`,
            group_id: createdGroup?.id,
          },
          { status: 500 }
        )
      }
    }

    return Response.json(createdGroup, { status: 201 })
  } catch (error) {
    console.error('Groups POST error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
