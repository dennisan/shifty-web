import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const Dashboard = ({ onNavigate }) => {
  const { userData, tenantData } = useAuth()
  const [stats, setStats] = useState({
    totalShifts: 0,
    activeShifts: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    upcomingShifts: 0,
    completedShifts: 0
  })
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)
  
  // Global flag to prevent duplicate calls across component instances
  if (!window.dashboardFetching) {
    window.dashboardFetching = new Set()
  }

  const fetchDashboardStats = useCallback(async () => {
    if (!tenantData?.id) {
      setLoading(false)
      return
    }

    console.log('Dashboard: Fetching real stats from database')
    setLoading(true)

    try {
      // Get current date for calculations
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Fetch posts and users data in parallel
      const [postsResult, usersResult] = await Promise.all([
        supabase
          .from('posts')
          .select('*')
          .eq('tid', tenantData.id)
          .gte('start_date', thirtyDaysAgo)
          .order('start_date', { ascending: false }),
        supabase
          .from('users')
          .select('*')
          .eq('tid', tenantData.id)
      ])

      if (postsResult.error) {
        console.error('Error fetching posts:', postsResult.error)
        return
      }

      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error)
        return
      }

      const posts = postsResult.data || []
      const users = usersResult.data || []

      // Calculate stats from the data
      const totalShifts = posts.length
      const totalEmployees = users.length
      const activeEmployees = users.filter(user => user.is_active).length

      // Calculate shift statuses
      const nowTime = now.getTime()
      const activeShifts = posts.filter(post => {
        const startTime = new Date(post.start_date + 'T' + post.start_time).getTime()
        const endTime = new Date(post.end_date + 'T' + post.end_time).getTime()
        return startTime <= nowTime && nowTime <= endTime
      }).length

      const upcomingShifts = posts.filter(post => {
        const startTime = new Date(post.start_date + 'T' + post.start_time).getTime()
        return startTime > nowTime
      }).length

      const completedShifts = posts.filter(post => {
        const endTime = new Date(post.end_date + 'T' + post.end_time).getTime()
        return endTime < nowTime
      }).length

      setStats({
        totalShifts,
        activeShifts,
        totalEmployees,
        activeEmployees,
        upcomingShifts,
        completedShifts
      })

      console.log('Dashboard: Stats calculated successfully')
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }, [tenantData?.id])

  useEffect(() => {
    // Reset fetch flag when tenant changes
    hasFetched.current = false
    // Clean up any existing global flags
    if (tenantData?.id) {
      window.dashboardFetching.delete(tenantData.id)
    }
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const StatCard = ({ title, value, subtitle, color = '#667eea' }) => {
    const isMobile = window.innerWidth <= 768
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: `3px solid ${color}`,
        flex: 1,
        minWidth: isMobile ? '120px' : '180px'
      }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          color: '#2d3748', 
          fontSize: isMobile ? '14px' : '16px', 
          fontWeight: '600'
        }}>
          {title}
        </h3>
        <div style={{ 
          fontSize: isMobile ? '24px' : '32px', 
          fontWeight: 'bold', 
          color: color, 
          marginBottom: '4px'
        }}>
          {loading ? '...' : value}
        </div>
        <div style={{ 
          fontSize: isMobile ? '12px' : '14px', 
          color: '#718096'
        }}>
          {subtitle}
        </div>
      </div>
    )
  }

  const QuickAction = ({ title, description, icon, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid #e2e8f0'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)'
        e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)'
        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '12px', pointerEvents: 'none' }}>{icon}</div>
      <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px', pointerEvents: 'none' }}>
        {title}
      </h4>
      <p style={{ margin: 0, color: '#718096', fontSize: '14px', pointerEvents: 'none' }}>
        {description}
      </p>
    </div>
  )

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '32px', fontWeight: 'bold' }}>
          Welcome back, {userData?.first_name || 'User'}!
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
          Here's what's happening at {tenantData?.name || 'your organization'} today.
        </p>
      </div>

      {/* Subscription Call-to-Action */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 'bold' }}>
            🚀 Upgrade Your Plan
          </h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px', opacity: 0.9 }}>
            Unlock premium features and scale your team with our professional plans.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('account-billing')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              View Plans
            </button>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          fontSize: '120px',
          opacity: 0.1,
          zIndex: 1
        }}>
          💎
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>

        <StatCard 
          title="Upcoming Shifts"
          value={stats.upcomingShifts}
          subtitle="Scheduled ahead"
          color="#3182ce"
        />
        <StatCard 
          title="Completed Shifts"
          value={stats.completedShifts}
          subtitle="Finished shifts"
          color="#805ad5"
        />
        <StatCard 
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle="Registered users"
          color="#ed8936"
        />
        <StatCard 
          title="Active Employees"
          value={stats.activeEmployees}
          subtitle="Currently working"
          color="#e53e3e"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '24px', fontWeight: '600' }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <QuickAction
            title="Manage Employees"
            description="View and manage your team members"
            icon="👤"
            onClick={() => onNavigate('employees')}
          />
          <QuickAction
            title="Manage Roles & Locations"
            description="Configure user roles and work locations"
            icon="👥"
            onClick={() => onNavigate('roles-locations')}
          />
          <QuickAction
            title="Create Shift"
            description="Schedule a new shift for your team"
            icon="📅"
            onClick={() => onNavigate('shifts')}
          />
          <QuickAction
            title="Get Help"
            description="Access QwikShift support and documentation"
            icon="❓"
            onClick={() => onNavigate('help')}
          />
        </div>
      </div>



      {/* Upcoming Shifts */}
      <div>
        <h2 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '24px', fontWeight: '600' }}>
          Upcoming Shifts
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
              Loading upcoming shifts...
            </div>
          ) : stats.upcomingShifts === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
              No upcoming shifts scheduled
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
              {stats.upcomingShifts} upcoming shifts scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 