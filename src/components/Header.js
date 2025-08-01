import React from 'react'
import { useAuth } from '../AuthContext'

const Header = ({ userData, tenantData, onMenuClick, sidebarOpen }) => {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      console.log('Header: Initiating sign out...')
      const { error } = await signOut()
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error signing out:', error.message)
        alert('Error signing out. Please try again.')
      } else {
        console.log('Header: Sign out successful')
      }
    } catch (error) {
      console.error('Unexpected error in handleSignOut:', error)
      // Don't show alert for session missing errors as they're handled gracefully
      if (!error.message?.includes('Auth session missing')) {
        alert('An unexpected error occurred while signing out.')
      }
    }
  }

  return (
    <header 
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Left side - Menu button and tenant name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Hamburger menu button - only show on mobile */}
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333'
          }}
          className="hamburger-menu"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Tenant name */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {tenantData?.name || 'Shifty'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {userData?.first_name} {userData?.last_name}
          </div>
        </div>
      </div>

      {/* Right side - Sign out button (desktop only) */}
      {window.innerWidth > 768 && (
        <button 
          onClick={handleSignOut}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Sign Out
        </button>
      )}
    </header>
  )
}

export default Header 