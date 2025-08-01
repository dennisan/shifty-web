import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children, onNavigate, currentView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userData, tenantData } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="layout">
      {/* Mobile overlay - only show on mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
        />
      )}

      {/* Header */}
      <Header 
        userData={userData}
        tenantData={tenantData}
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        userData={userData}
        tenantData={tenantData}
        onNavigate={onNavigate}
        currentView={currentView}
      />

      {/* Main content */}
      <main 
        className="main-content"
        style={{
          padding: '20px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f8f9fa'
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer 
        className="footer"
        style={{
          backgroundColor: '#343a40',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          marginTop: 'auto'
        }}
      >
        <p style={{ margin: 0 }}>
          © 2025 Signal Peak Software. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Layout 