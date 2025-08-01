import React, { useState } from 'react'
import { useAuth } from '../AuthContext'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      console.log('Attempting authentication...', { email, isSignUp })
      
      const { data, error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      console.log('Authentication result:', { data, error })

      if (error) {
        console.error('Authentication error:', error)
        setError(error.message)
      } else if (isSignUp) {
        setMessage('Check your email for the confirmation link!')
      }
    } catch (err) {
      console.error('Unexpected error during authentication:', err)
      setError('An unexpected error occurred: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#2a2a2a',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          Signal Peak Software
        </h1>
        <button 
          onClick={() => setShowLoginModal(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            margin: 0
          }}>
            Welcome to QwikShift
          </h2>
          <img 
            src="/QwikShiftLogo.png" 
            alt="QwikShift Logo" 
            style={{
              height: '60px',
              width: 'auto'
            }}
          />
        </div>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Streamline your workforce management with powerful scheduling, employee tracking, and analytics
        </p>
        <button 
          onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })}
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Learn More
        </button>
      </section>

      {/* Features Section */}
      <section id="features-section" style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
        color: '#2a2a2a'
      }}>
        <h3 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '3rem',
          color: '#667eea'
        }}>
          QwikShift Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Smart Scheduling</h4>
            <p>Create and manage shifts with drag-and-drop ease. Handle complex schedules, overtime tracking, and shift swaps.</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Employee Management</h4>
            <p>Track employee roles, locations, and performance. Manage permissions and access levels efficiently.</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Analytics & Reporting</h4>
            <p>Get insights into workforce patterns, productivity metrics, and operational efficiency.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: '#f6f8fa',
        color: '#2a2a2a'
      }}>
        <h3 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '3rem',
          color: '#667eea'
        }}>
          Pricing Plans
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Starter</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>$29/month</p>
            <p>Perfect for small teams up to 10 employees</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #667eea'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Professional</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>$79/month</p>
            <p>Ideal for growing businesses up to 50 employees</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Enterprise</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>Custom</p>
            <p>Tailored solutions for large organizations</p>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
        color: '#2a2a2a'
      }}>
        <h3 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '3rem',
          color: '#667eea'
        }}>
          Support & Contact
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Email Support</h4>
            <p>Get help at signalpeaksw@outlook.com</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Documentation</h4>
            <p>Comprehensive guides and tutorials</p>
          </div>
          <div style={{
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Based in Utah</h4>
            <p>Washington, Utah, USA</p>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '28px',
              fontWeight: '600'
            }}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="auth-toggle">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="toggle-button"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1rem'
        }}>
          <a href="/privacy.html" style={{
            color: 'white',
            textDecoration: 'none',
            opacity: 0.8
          }}>Privacy Policy</a>
          <a href="/terms.html" style={{
            color: 'white',
            textDecoration: 'none',
            opacity: 0.8
          }}>Terms of Service</a>
          <a href="mailto:signalpeaksw@outlook.com" style={{
            color: 'white',
            textDecoration: 'none',
            opacity: 0.8
          }}>Support</a>
        </div>
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Signal Peak Software. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Auth 