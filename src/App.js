import React, { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import UserView from './components/UserView'
import Layout from './components/Layout'
import OrganizationalSettings from './components/OrganizationalSettings'
import RolesLocations from './components/RolesLocations'
import Shifts from './components/Shifts'
import Analytics from './components/Analytics'
import Help from './components/Help'
import AccountBilling from './components/AccountBilling'
import Employees from './components/Employees'

const AppContent = () => {
  const { user, userData, tenantData, loading } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')

  console.log('AppContent render:', { user, userData, tenantData, loading })

  if (loading) {
    console.log('Showing loading state')
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  console.log('Rendering main content, user:', user ? 'exists' : 'null')

  const handleNavigateToUserView = () => {
    setCurrentView('userview')
  }

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const renderAuthenticatedContent = () => {
    switch (currentView) {
      case 'userview':
        return <UserView onNavigateToDashboard={handleNavigateToDashboard} />
      case 'org-settings':
        return <OrganizationalSettings />
      case 'employees':
        return <Employees />
      case 'roles-locations':
        return <RolesLocations />
      case 'shifts':
        return <Shifts />
      case 'analytics':
        return <Analytics />
      case 'help':
        return <Help />
      case 'account-billing':
        return <AccountBilling />
      case 'dashboard':
      default:
        return <Dashboard onNavigateToUserView={handleNavigateToUserView} onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="App">
      {user ? (
        <Layout onNavigate={handleNavigation} currentView={currentView}>
          {renderAuthenticatedContent()}
        </Layout>
      ) : (
        <Auth />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
