import { supabase, supabaseService } from '../supabaseClient'

export const fetchUserAndTenantInfo = async (userId) => {
  try {
    console.log('Starting fetchUserAndTenantInfo for userId:', userId)
    
    // First, fetch user information including tenant ID
    console.log('Fetching user data from users table...')
    
    // Add timeout to prevent hanging
    const userQueryPromise = supabase
      .from('users')
      .select(`
        *,
        roles:role_id (
          id,
          name,
          license,
          license_exp,
          is_admin,
          can_manage_shifts
        ),
        locations:primary_location_id (
          id,
          name,
          address,
          type,
          is_default
        )
      `)
      .eq('id', userId)
      .single()

    // Add a timeout of 10 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    )

    const { data: userData, error: userError } = await Promise.race([
      userQueryPromise,
      timeoutPromise
    ])

    console.log('User query result:', { userData, userError })

    if (userError) {
      console.error('Error fetching user data:', userError)
      
      // If user doesn't exist in users table, return null data
      if (userError.code === 'PGRST116') {
        console.log('User not found in users table - this is expected for new users')
        return {
          user: null,
          tenant: null
        }
      }
      
      throw userError
    }

    if (!userData) {
      console.log('User not found in database - this is expected for new users')
      return {
        user: null,
        tenant: null
      }
    }

    console.log('User data found:', userData)
    console.log('Tenant ID from user data:', userData.tid)

    // Then, fetch tenant information using the tid from user data
    console.log('Fetching tenant data from tenants table...')
    
    const tenantQueryPromise = supabaseService
      .from('tenants')
      .select('*')
      .eq('id', userData.tid)
      .single()

    const { data: tenantData, error: tenantError } = await Promise.race([
      tenantQueryPromise,
      timeoutPromise
    ])

    console.log('Tenant query result:', { tenantData, tenantError })

    if (tenantError) {
      console.error('Error fetching tenant data:', tenantError)
      throw tenantError
    }

    if (!tenantData) {
      console.error('Tenant not found in database')
      throw new Error('Tenant not found in database')
    }

    console.log('Tenant data found:', tenantData)

    return {
      user: userData,
      tenant: tenantData
    }
  } catch (error) {
    console.error('Error in fetchUserAndTenantInfo:', error)
    throw error
  }
} 