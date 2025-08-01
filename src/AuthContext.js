import React, { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchUserData = async (userId) => {
    try {
      console.log('Fetching user data for userId:', userId)
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
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('Getting initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session data:', session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('User found in session, fetching user data...')
        await fetchUserData(session.user.id)
      } else {
        console.log('No user in session')
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUserData(null)
          setTenantData(null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
      console.log('Sign in successful, fetching user data...')
      // Fetch user and tenant data after successful sign in
      await fetchUserData(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setUserData(null)
      setTenantData(null)
    }
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
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
  }

  // Only log when state actually changes (optional)
  // console.log('AuthContext state:', { user, userData, tenantData, loading })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 