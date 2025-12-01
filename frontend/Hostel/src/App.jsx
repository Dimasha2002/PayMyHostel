import { useState, useEffect } from 'react'
import Home from './pages/Student/Home'
import Register from './pages/Student/Register'
import Login from './pages/Student/Login'
import Dashboard from './pages/Student/Dashboard'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('currentUser')

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setCurrentUser(parsedUser)
        setCurrentPage(parsedUser?.role === 'admin' ? 'admin-dashboard' : 'dashboard')
      } catch (error) {
        console.error('Failed to restore session', error)
        localStorage.removeItem('currentUser')
      }
    }

    // Listen for unauthorized events from API interceptor
    const handleUnauthorized = () => {
      setCurrentUser(null)
      setCurrentPage('home')
    }

    window.addEventListener('unauthorized', handleUnauthorized)
    return () => window.removeEventListener('unauthorized', handleUnauthorized)
  }, [])

  const handleGetStarted = () => {
    setCurrentPage('register')
  }

  const handleBackHome = () => {
    setCurrentPage('home')
  }

  const handleSwitchToLogin = () => {
    setCurrentPage('login')
  }

  const handleSwitchToRegister = () => {
    setCurrentPage('register')
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
    setCurrentUser(null)
    setCurrentPage('home')
  }

  const handleAdminLogin = () => {
    setCurrentPage('admin-login')
  }

  const handleAdminLoginSuccess = (admin) => {
    setCurrentUser(admin)
    setCurrentPage('admin-dashboard')
  }

  return (
    <>
      {currentPage === 'home' && (
        <Home onGetStarted={handleGetStarted} onAdminLogin={handleAdminLogin} />
      )}
      {currentPage === 'register' && (
        <Register onBackHome={handleBackHome} onSwitchToLogin={handleSwitchToLogin} />
      )}
      {currentPage === 'login' && (
        <Login onBackHome={handleBackHome} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
      {currentPage === 'admin-login' && (
        <AdminLogin onBackHome={handleBackHome} onLoginSuccess={handleAdminLoginSuccess} />
      )}
      {currentPage === 'admin-dashboard' && (
        <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
