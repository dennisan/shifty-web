import { supabase, supabaseService } from '../supabaseClient'

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map()

export const fetchUserAndTenantInfo = async (userId) => {
  console.log('userService: Using mock data (queries disabled)')
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Return mock user and tenant data
  return {
    user: {
      id: userId,
      first_name: 'Alex',
      last_name: 'Morgan',
      email: 'alex.morgan@example.com',
      tid: 'f9e12108-90bb-4e0b-b225-8d6933aeaf81',
      role_id: '5c1d3000-4b12-488d-af4e-754917886dff',
      primary_location_id: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    tenant: {
      id: 'f9e12108-90bb-4e0b-b225-8d6933aeaf81',
      name: 'Vetcor',
      address: '456 Elm St, Metropolis, NY',
      activation_code: 'C2J4JXUI',
      is_registration_enabled: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
} 