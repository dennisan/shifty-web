import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpfwgrxofymtauawxmeo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZndncnhvZnltdGF1YXd4bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTkyNzcsImV4cCI6MjA2MzM3NTI3N30.Tf7GykDSQjTz1BK68KWzWWDVhpXX_vN90KOU_Q2Z18w'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZndncnhvZnltdGF1YXd4bWVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc5OTI3NywiZXhwIjoyMDYzMzc1Mjc3fQ.dltJ2issP0tUpUmhB1EBLpeIiWfGAPYJPh9psgcuEa4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error)
  } else {
    console.log('Supabase connected successfully')
  }
}) 