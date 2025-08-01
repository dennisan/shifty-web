import React from 'react'

const Sidebar = ({ isOpen, onClose, userData, tenantData }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'org-settings', label: 'Organizational Settings', icon: '⚙️', path: '/org-settings' },
    { id: 'roles-locations', label: 'Roles & Locations', icon: '👥', path: '/roles-locations' },
    { id: 'shifts', label: 'Shifts', icon: '📅', path: '/shifts' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
    { id: 'help', label: 'Help', icon: '❓', path: '/help' },
    { id: 'account-billing', label: 'Account / Billing', icon: '💳', path: '/account-billing' }
  ]

  const handleItemClick = (item) => {
    // TODO: Implement navigation
    console.log('Navigate to:', item.path)
    onClose() // Close sidebar on mobile
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
          width: '250px',
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
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#34495e'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
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
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#34495e'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
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