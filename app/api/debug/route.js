export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return Response.json({
    env_set: {
      url: url ? '✅ SET' : '❌ MISSING',
      key: key ? '✅ SET' : '❌ MISSING',
    },
    values: {
      url: url || 'undefined',
      key_length: key ? key.length : 0,
      key_start: key ? key.substring(0, 20) + '...' : 'undefined',
    },
    node_env: process.env.NODE_ENV,
  })
}
