// Script to create initial admin user
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ukmjspvhvughrdjexqwu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbWpzcHZodnVnaHJkamV4cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDQ4MzcsImV4cCI6MjA1MTkyMDgzN30.K6mJKL3Q_1oPj-rLLRGKPz_hM2ld7HJrO0iWzFPEYLQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  try {
    console.log('Creating admin user with login code: 15...')

    const { data, error } = await supabase
      .from('coaches')
      .insert([
        {
          name: 'מנהל',
          email: 'admin@sailing.local',
          login_code: '15',
          is_admin: true,
          avatar_url: null,
        }
      ])
      .select()

    if (error) {
      console.error('Error:', error.message)
      return
    }

    console.log('✅ Admin created successfully!')
    console.log('ID:', data[0].id)
    console.log('Name:', data[0].name)
    console.log('Login Code: 15')
    console.log('Is Admin: true')
    console.log('\nYou can now log in with code: 15')
  } catch (err) {
    console.error('Error:', err.message)
  }
}

createAdmin()
