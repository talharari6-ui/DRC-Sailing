export async function POST(request) {
  try {
    const supabase = getSupabaseClient()
    // Logout is mostly client-side (localStorage cleared)
    // This endpoint can be used for server-side cleanup if needed
    return Response.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { error: 'שגיאה בהתנתקות' },
      { status: 500 }
    )
  }
}
