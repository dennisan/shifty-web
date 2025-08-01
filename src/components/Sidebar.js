import React from 'react'
import { useAuth } from '../AuthContext'

const Sidebar = ({ isOpen, onClose, userData, tenantData, onNavigate, currentView }) => {
  const { signOut } = useAuth()
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'account-billing', label: 'Subscription', icon: '💳', path: '/account-billing' },
    { id: 'employees', label: 'Employees', icon: '👨‍💼', path: '/employees' },
    { id: 'roles-locations', label: 'Roles & Locations', icon: '👥', path: '/roles-locations' },
    { id: 'shifts', label: 'Shifts', icon: '📅', path: '/shifts' },
    { id: 'org-settings', label: 'Settings', icon: '⚙️', path: '/org-settings' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
    { id: 'help', label: 'Help', icon: '❓', path: '/help' },
  ]

  const mobileMenuItems = [
    ...menuItems,
    { id: 'signout', label: 'Sign Out', icon: '🚪', path: '/signout', isSignOut: true }
  ]

  const handleItemClick = (item) => {
    console.log('Navigate to:', item.id)
    onNavigate(item.id)
    onClose() // Close sidebar on mobile
  }

  const handleSignOut = async () => {
    try {
      console.log('Sidebar: Initiating sign out...')
      const { error } = await signOut()
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error signing out:', error.message)
        alert('Error signing out. Please try again.')
      } else {
        console.log('Sidebar: Sign out successful')
      }
      onClose() // Close sidebar
    } catch (error) {
      console.error('Unexpected error in handleSignOut:', error)
      if (!error.message?.includes('Auth session missing')) {
        alert('An unexpected error occurred while signing out.')
      }
      onClose() // Close sidebar
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="sidebar-desktop"
        style={{
          position: 'fixed',
          left: 0,
          top: 64, // Below header
          bottom: 0,
          width: '200px',
          backgroundColor: '#2c3e50',
          color: 'white',
          overflowY: 'auto',
          zIndex: 999,
          display: 'none' // Hidden by default, will be shown with CSS
        }}
      >
        <nav style={{ padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: currentView === item.id ? '#667eea' : 'transparent',
                    border: currentView === item.id ? 'none' : 'none',
                    color: currentView === item.id ? 'white' : 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s',
                    fontWeight: currentView === item.id ? '600' : '400',
                    borderLeft: currentView === item.id ? '4px solid white' : '4px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (currentView !== item.id) {
                      e.target.style.backgroundColor = '#34495e'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentView !== item.id) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className="sidebar-mobile"
        style={{
          position: 'fixed',
          left: isOpen ? 0 : '-280px',
          top: 64, // Below header
          bottom: 0,
          width: '280px',
          backgroundColor: '#2c3e50',
          color: 'white',
          overflowY: 'auto',
          zIndex: 999,
          transition: 'left 0.3s ease',
          display: 'none' // Hidden by default, will be shown with CSS
        }}
      >
        <nav style={{ padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {mobileMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => item.isSignOut ? handleSignOut() : handleItemClick(item)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    backgroundColor: item.isSignOut ? '#dc3545' : (currentView === item.id ? '#667eea' : 'transparent'),
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'background-color 0.2s',
                    fontWeight: item.isSignOut ? '600' : (currentView === item.id ? '600' : '400'),
                    borderLeft: item.isSignOut ? '4px solid #ff6b6b' : (currentView === item.id ? '4px solid white' : '4px solid transparent')
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isSignOut && currentView !== item.id) {
                      e.target.style.backgroundColor = '#34495e'
                    } else if (item.isSignOut) {
                      e.target.style.backgroundColor = '#c82333'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.isSignOut && currentView !== item.id) {
                      e.target.style.backgroundColor = 'transparent'
                    } else if (item.isSignOut) {
                      e.target.style.backgroundColor = '#dc3545'
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar 