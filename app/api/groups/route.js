import { getSupabaseClient } from '@/src/lib/supabase'

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getSeasonEndDate(start) {
  // Season always ends on June 30. If season starts after June, end on next year's June 30.
  const seasonEndYear = start.getMonth() > 5 ? start.getFullYear() + 1 : start.getFullYear()
  return new Date(seasonEndYear, 5, 30, 12, 0, 0, 0)
}

function buildPlannedSessions({ groupId, daysOfWeek, startDate, startTime, endTime }) {
  const sessions = []
  const activeDays = Array.isArray(daysOfWeek) ? daysOfWeek : []
  if (!groupId || activeDays.length === 0) return sessions

  const rawStart = startDate ? new Date(`${startDate}T12:00:00`) : new Date()
  const start = Number.isNaN(rawStart.getTime()) ? new Date() : rawStart
  start.setHours(12, 0, 0, 0)

  const horizon = getSeasonEndDate(start)

  for (let date = new Date(start); date <= horizon; date.setDate(date.getDate() + 1)) {
    if (!activeDays.includes(date.getDay())) continue
    sessions.push({
      group_id: groupId,
      date: toDateKey(date),
      start_time: startTime || null,
      end_time: endTime || null,
      cancelled: false,
      admin_approved: true,
    })
  }

  return sessions
}

async function insertSessionsWithFallback(supabase, sessions, coachId) {
  const extractMissingColumn = (message) => {
    const match = (message || '').match(/Could not find the '([^']+)' column/i)
    return match?.[1] || null
  }

  // Start with all optional columns; strip missing ones dynamically.
  let payload = sessions.map((s) => ({ ...s, coach_id: coachId }))
  const removedColumns = new Set()

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { error } = await supabase.from('sessions').insert(payload)
    if (!error) return null

    const missingColumn = extractMissingColumn(error.message)
    if (!missingColumn || removedColumns.has(missingColumn)) {
      return error
    }

    removedColumns.add(missingColumn)
    payload = payload.map((session) => {
      const next = { ...session }
      delete next[missingColumn]
      return next
    })
  }

  return { message: 'Failed to insert sessions after schema fallback retries.' }
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
      .insert([
        {
          name,
          coach_id,
          color: color || '#3b82f6',
          days_of_week: days_of_week || [],
          start_time: start_time || '',
          end_time: end_time || '',
          start_date: start_date || null,
        },
      ])
      .select()

    if (error) throw error

    const createdGroup = data[0]
    const sessionsToCreate = buildPlannedSessions({
      groupId: createdGroup?.id,
      daysOfWeek: days_of_week,
      startDate: start_date,
      startTime: start_time,
      endTime: end_time,
    })

    if (sessionsToCreate.length > 0) {
      const sessionsError = await insertSessionsWithFallback(supabase, sessionsToCreate, coach_id)
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
