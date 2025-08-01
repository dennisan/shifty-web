import React, { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'

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

  // Mock data for now - in real app this would come from API
  useEffect(() => {
    // Simulate loading dashboard data
    setStats({
      totalShifts: 156,
      activeShifts: 23,
      totalEmployees: 45,
      activeEmployees: 38,
      upcomingShifts: 12,
      completedShifts: 121
    })
  }, [])

  const StatCard = ({ title, value, subtitle, color = '#667eea' }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: `3px solid ${color}`,
      flex: 1,
      minWidth: '180px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>
        {title}
      </h3>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#718096' }}>
        {subtitle}
      </div>
    </div>
  )

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
            <button
              onClick={() => console.log('Contact sales')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'white'
              }}
            >
              Contact Sales
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard 
          title="Total Shifts"
          value={stats.totalShifts}
          subtitle="This month"
          color="#667eea"
        />
        <StatCard 
          title="Active Shifts"
          value={stats.activeShifts}
          subtitle="Currently running"
          color="#38a169"
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
            title="Create Shift"
            description="Schedule a new shift for your team"
            icon="📅"
            onClick={() => onNavigate('shifts')}
          />
          <QuickAction
            title="Invite Employees"
            description="Send invitations to new team members"
            icon="👤"
            onClick={() => onNavigate('employees')}
          />
          <QuickAction
            title="View Schedule"
            description="See this week's shift schedule"
            icon="📋"
            onClick={() => onNavigate('shifts')}
          />
          <QuickAction
            title="Manage Roles & Locations"
            description="Configure user roles and work locations"
            icon="👥"
            onClick={() => onNavigate('roles-locations')}
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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🌅</span>
            <div>
              <div style={{ fontWeight: '600', color: '#2d3748' }}>Morning Shift</div>
              <div style={{ fontSize: '14px', color: '#718096' }}>Tomorrow, 6:00 AM - 2:00 PM • 4 employees</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#718096' }}>Tomorrow</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🌆</span>
            <div>
              <div style={{ fontWeight: '600', color: '#2d3748' }}>Evening Shift</div>
              <div style={{ fontSize: '14px', color: '#718096' }}>Tomorrow, 2:00 PM - 10:00 PM • 3 employees</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#718096' }}>Tomorrow</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🌙</span>
            <div>
              <div style={{ fontWeight: '600', color: '#2d3748' }}>Night Shift</div>
              <div style={{ fontSize: '14px', color: '#718096' }}>Wednesday, 10:00 PM - 6:00 AM • 2 employees</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#718096' }}>Wednesday</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 