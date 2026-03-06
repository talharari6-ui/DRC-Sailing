export async function GET() {
  try {
    const { getSupabaseClient } = require('@/src/lib/supabase')

    // Test 1: Can we get the Supabase client?
    let client
    try {
      client = getSupabaseClient()
    } catch (err) {
      return Response.json({
        status: 'error',
        message: 'Failed to initialize Supabase client',
        error: err.message
      }, { status: 500 })
    }

    // Test 2: Can we query the database?
    const { data, error } = await client
      .from('coaches')
      .select('count', { count: 'exact' })

    if (error) {
      return Response.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    // Test 3: Find coach with code 15
    const { data: coaches, error: coachError } = await client
      .from('coaches')
      .select('*')
      .eq('login_code', '15')

    if (coachError) {
      return Response.json({
        status: 'error',
        message: 'Failed to find coach',
        error: coachError.message,
        code: coachError.code
      }, { status: 500 })
    }

    return Response.json({
      status: 'healthy',
      database: {
        connected: true,
        message: 'Connected successfully'
      },
      coaches: {
        found: coaches.length,
        data: coaches
      }
    })
  } catch (err) {
    return Response.json({
      status: 'error',
      message: 'Unexpected error',
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
