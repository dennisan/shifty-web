import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gpfwgrxofymtauawxmeo.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZndncnhvZnltdGF1YXd4bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTkyNzcsImV4cCI6MjA2MzM3NTI3N30.Tf7GykDSQjTz1BK68KWzWWDVhpXX_vN90KOU_Q2Z18w'
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY

// Check if we're in development and disable the warning
if (process.env.NODE_ENV === 'development') {
  // Suppress the multiple instances warning in development
  const originalWarn = console.warn
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Multiple GoTrueClient instances')) {
      return // Suppress this specific warning
    }
    originalWarn.apply(console, args)
  }
}

// Use global variables to ensure true singletons across hot reloads
if (!window.supabaseInstance) {
  window.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  console.log('Created new Supabase client instance')
} else {
  console.log('Reusing existing Supabase client instance')
}

if (!window.supabaseServiceInstance) {
  window.supabaseServiceInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('Created new Supabase service client instance')
} else {
  console.log('Reusing existing Supabase service client instance')
}

export const supabase = window.supabaseInstance
export const supabaseService = window.supabaseServiceInstance

// Test the connection only once
if (!window.supabaseTested) {
  window.supabaseTested = true
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Supabase connected successfully')
    }
  })
} 