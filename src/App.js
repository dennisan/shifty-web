import React, { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './AuthContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import UserView from './components/UserView'

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

  const renderAuthenticatedContent = () => {
    switch (currentView) {
      case 'userview':
        return <UserView onNavigateToDashboard={handleNavigateToDashboard} />
      case 'dashboard':
      default:
        return <Dashboard onNavigateToUserView={handleNavigateToUserView} />
    }
  }

  return (
    <div className="App">
      {user ? renderAuthenticatedContent() : <Auth />}
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
