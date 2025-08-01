import React, { useState, useEffect } from 'react'
import { supabaseService } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const OrganizationalSettings = () => {
  const { tenantData } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    activation_code: '',
    is_registration_enabled: false
  })

  useEffect(() => {
    if (tenantData) {
      setFormData({
        name: tenantData.name || '',
        address: tenantData.address || '',
        activation_code: tenantData.activation_code || '',
        is_registration_enabled: tenantData.is_registration_enabled || false
      })
    }
  }, [tenantData])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    if (!tenantData?.id) {
      setMessage('No tenant data available')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabaseService
        .from('tenants')
        .update({
          name: formData.name,
          address: formData.address,
          activation_code: formData.activation_code,
          is_registration_enabled: formData.is_registration_enabled
        })
        .eq('id', tenantData.id)

      if (error) {
        console.error('Error updating tenant:', error)
        setMessage('Error updating tenant settings')
      } else {
        setMessage('Tenant settings updated successfully!')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating tenant:', error)
      setMessage('Error updating tenant settings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: tenantData?.name || '',
      address: tenantData?.address || '',
      activation_code: tenantData?.activation_code || '',
      is_registration_enabled: tenantData?.is_registration_enabled || false
    })
    setIsEditing(false)
    setMessage('')
  }

  if (!tenantData) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Organizational Settings</h1>
        <p>Loading tenant data...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#2d3748' }}>
            Organizational Settings
          </h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
            Manage your organization's basic information and settings
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Edit Settings
          </button>
        )}
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '6px',
          backgroundColor: message.includes('Error') ? '#fed7d7' : '#c6f6d5',
          color: message.includes('Error') ? '#c53030' : '#2f855a',
          border: `1px solid ${message.includes('Error') ? '#feb2b2' : '#9ae6b4'}`
        }}>
          {message}
        </div>
      )}

      <div style={{
        border: '3px solid #667eea',
        borderRadius: '16px',
        backgroundColor: 'white',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold', color: '#2d3748' }}>
          Organization Information
        </h3>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Organization Name */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Organization Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              />
            ) : (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3748'
              }}>
                {tenantData.name}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Address
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3748',
                minHeight: '60px'
              }}>
                {tenantData.address || 'No address provided'}
              </div>
            )}
          </div>

          {/* Activation Code */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Activation Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="activation_code"
                value={formData.activation_code}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              />
            ) : (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#2d3748',
                fontFamily: 'monospace'
              }}>
                {tenantData.activation_code}
              </div>
            )}
          </div>

          {/* Registration Enabled */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
              cursor: isEditing ? 'pointer' : 'default'
            }}>
              {isEditing ? (
                <input
                  type="checkbox"
                  name="is_registration_enabled"
                  checked={formData.is_registration_enabled}
                  onChange={handleInputChange}
                  style={{
                    marginRight: '8px',
                    width: '16px',
                    height: '16px'
                  }}
                />
              ) : (
                <div style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  backgroundColor: tenantData.is_registration_enabled ? '#667eea' : '#e2e8f0',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px'
                }}>
                  {tenantData.is_registration_enabled ? '✓' : ''}
                </div>
              )}
              Allow New User Registration
            </label>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#718096'
            }}>
              When enabled, new users can register using the activation code
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#218838')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#28a745')}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#5a6268')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6c757d')}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganizationalSettings 