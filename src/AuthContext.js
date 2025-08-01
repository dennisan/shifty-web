import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import { fetchUserAndTenantInfo } from './services/userService'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [tenantData, setTenantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchingUserData = useRef(false)

  const fetchUserData = async (userId) => {
    // Prevent duplicate calls
    if (fetchingUserData.current) {
      console.log('AuthContext: Skipping fetch - already fetching user data')
      return
    }

    try {
      console.log('Fetching user data for userId:', userId)
      fetchingUserData.current = true
      const { user: userInfo, tenant: tenantInfo } = await fetchUserAndTenantInfo(userId)
      console.log('User data fetched:', userInfo)
      console.log('Tenant data fetched:', tenantInfo)
      setUserData(userInfo)
      setTenantData(tenantInfo)
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Set null data on error
      setUserData(null)
      setTenantData(null)
    } finally {
      fetchingUserData.current = false
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            console.log('Invalid refresh token detected, clearing session...')
            await clearInvalidSession()
          }
          setLoading(false)
          return
        }
        
        console.log('Session data:', session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User found in session, fetching user data...')
          await fetchUserData(session.user.id)
        } else {
          console.log('No user in session')
        }
      } catch (error) {
        console.error('Error in getSession:', error)
        if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
          await clearInvalidSession()
        }
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Temporarily disabled onAuthStateChange to prevent duplicate calls
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
    // return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user) {
      console.log('Sign in successful, setting user and fetching user data...')
      setUser(data.user)
      // Fetch user and tenant data after successful sign in
      await fetchUserData(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      
      // Clear all local storage and session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut()
      
      // Clear state regardless of error
      setUser(null)
      setUserData(null)
      setTenantData(null)
      
      if (!error) {
        console.log('Sign out successful')
      } else {
        console.error('Error during sign out:', error)
      }
      
      // Redirect to login page instead of reloading
      window.location.href = '/'
      return { error }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      // Clear state even if there's an error
      setUser(null)
      setUserData(null)
      setTenantData(null)
      // Redirect to login page
      window.location.href = '/'
      return { error }
    }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const clearInvalidSession = async () => {
    try {
      console.log('Clearing invalid session...')
      await supabase.auth.signOut()
      setUser(null)
      setUserData(null)
      setTenantData(null)
      // Clear all stored auth data
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  const value = {
    user,
    userData,
    tenantData,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearInvalidSession,
  }

  // Only log when state actually changes (optional)
  // console.log('AuthContext state:', { user, userData, tenantData, loading })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 