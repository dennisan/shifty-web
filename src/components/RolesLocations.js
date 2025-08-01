import React, { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const RolesLocations = () => {
  const { userData, tenantData } = useAuth()
  const [roles, setRoles] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Roles state
  const [roleSortField, setRoleSortField] = useState('name')
  const [roleSortDirection, setRoleSortDirection] = useState('asc')
  
  // Locations state
  const [locationSortField, setLocationSortField] = useState('name')
  const [locationSortDirection, setLocationSortDirection] = useState('asc')
  
  // Form states
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  
  // Role form data
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    is_admin: false,
    can_manage_shifts: false
  })
  
  // Location form data
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    type: '',
    address: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantData?.id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('*')
          .eq('tid', tenantData.id)
          .order('name', { ascending: true })

        if (rolesError) {
          console.error('Error fetching roles:', rolesError)
          setError('Failed to load roles')
          return
        }

        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('tid', tenantData.id)
          .order('name', { ascending: true })

        if (locationsError) {
          console.error('Error fetching locations:', locationsError)
          setError('Failed to load locations')
          return
        }

        setRoles(rolesData || [])
        setLocations(locationsData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantData?.id])

  // Roles sorting and filtering
  const handleRoleSort = (field) => {
    if (roleSortField === field) {
      setRoleSortDirection(roleSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setRoleSortField(field)
      setRoleSortDirection('asc')
    }
  }

  const getFilteredAndSortedRoles = () => {
    if (!roles.length) return roles

    return roles.sort((a, b) => {
      let aValue, bValue

      switch (roleSortField) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'type':
          aValue = a.type || ''
          bValue = b.type || ''
          break
        case 'license':
          aValue = a.license || ''
          bValue = b.license || ''
          break
        case 'can_manage_shifts':
          aValue = a.can_manage_shifts ? 'yes' : 'no'
          bValue = b.can_manage_shifts ? 'yes' : 'no'
          break
        default:
          return 0
      }

      if (roleSortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  // Locations sorting and filtering
  const handleLocationSort = (field) => {
    if (locationSortField === field) {
      setLocationSortDirection(locationSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setLocationSortField(field)
      setLocationSortDirection('asc')
    }
  }

  const getFilteredAndSortedLocations = () => {
    if (!locations.length) return locations

    return locations.sort((a, b) => {
      let aValue, bValue

      switch (locationSortField) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'type':
          aValue = a.type || ''
          bValue = b.type || ''
          break
        case 'address':
          aValue = a.address || ''
          bValue = b.address || ''
          break
        default:
          return 0
      }

      if (locationSortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Role form handlers
  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const roleData = {
        ...roleFormData,
        tid: tenantData.id
      }

      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', editingRole.id)

        if (error) throw error
      } else {
        // Create new role
        const { error } = await supabase
          .from('roles')
          .insert(roleData)

        if (error) throw error
      }

      // Reset form and refresh data
      setShowRoleForm(false)
      setEditingRole(null)
      setRoleFormData({ name: '', is_admin: false, can_manage_shifts: false })
      
      // Refresh roles data
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .eq('tid', tenantData.id)
        .order('name', { ascending: true })
      
      setRoles(rolesData || [])
    } catch (error) {
      console.error('Error saving role:', error)
      alert('Error saving role. Please try again.')
    }
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      is_admin: role.is_admin,
      can_manage_shifts: role.can_manage_shifts
    })
    setShowRoleForm(true)
  }

  const handleCancelRole = () => {
    setShowRoleForm(false)
    setEditingRole(null)
    setRoleFormData({ name: '', is_admin: false, can_manage_shifts: false })
  }

  // Location form handlers
  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const locationData = {
        ...locationFormData,
        tid: tenantData.id
      }

      if (editingLocation) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editingLocation.id)

        if (error) throw error
      } else {
        // Create new location
        const { error } = await supabase
          .from('locations')
          .insert(locationData)

        if (error) throw error
      }

      // Reset form and refresh data
      setShowLocationForm(false)
      setEditingLocation(null)
      setLocationFormData({ name: '', type: '', address: '' })
      
      // Refresh locations data
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('tid', tenantData.id)
        .order('name', { ascending: true })
      
      setLocations(locationsData || [])
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Error saving location. Please try again.')
    }
  }

  const handleEditLocation = (location) => {
    setEditingLocation(location)
    setLocationFormData({
      name: location.name,
      type: location.type || '',
      address: location.address || ''
    })
    setShowLocationForm(true)
  }

  const handleCancelLocation = () => {
    setShowLocationForm(false)
    setEditingLocation(null)
    setLocationFormData({ name: '', type: '', address: '' })
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading roles and locations...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          color: '#dc3545', 
          textAlign: 'center', 
          padding: '20px' 
        }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '32px', fontWeight: 'bold' }}>
          Roles & Locations
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
          Manage roles and locations for your organization
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: window.innerWidth <= 768 ? '16px' : '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '3px solid #667eea'
        }}>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '12px' : '14px', 
            color: '#666', 
            marginBottom: '8px' 
          }}>Total Roles</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#2d3748' 
          }}>
            {roles.length}
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: window.innerWidth <= 768 ? '16px' : '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '3px solid #28a745'
        }}>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '12px' : '14px', 
            color: '#666', 
            marginBottom: '8px' 
          }}>Total Locations</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#28a745' 
          }}>
            {locations.length}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ margin: 0, color: '#2d3748', fontSize: '24px', fontWeight: 'bold' }}>
            Roles
          </h2>
          <button
            onClick={() => setShowRoleForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Add Role
          </button>
        </div>

        {/* Role Form */}
        {showRoleForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h3>
            <form onSubmit={handleRoleSubmit}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Permissions
                  </label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={roleFormData.is_admin}
                        onChange={(e) => setRoleFormData({...roleFormData, is_admin: e.target.checked})}
                      />
                      <span style={{ fontSize: '14px' }}>Admin</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={roleFormData.can_manage_shifts}
                        onChange={(e) => setRoleFormData({...roleFormData, can_manage_shifts: e.target.checked})}
                      />
                      <span style={{ fontSize: '14px' }}>Shift Manager</span>
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelRole}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Roles Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>


          {roles.length === 0 ? (
            <div style={{ 
              padding: '40px 24px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              No roles found
            </div>
          ) : (
            <div>
              {/* Roles Table Header */}
              {window.innerWidth <= 768 ? (
                <div></div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: '20px',
                  padding: '16px 24px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2d3748'
                }}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRoleSort('name')}
                  >
                    Role Name
                    {roleSortField === 'name' && (
                      <span style={{ marginLeft: '5px' }}>
                        {roleSortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div>Admin</div>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRoleSort('can_manage_shifts')}
                  >
                    Shift Manager
                    {roleSortField === 'can_manage_shifts' && (
                      <span style={{ marginLeft: '5px' }}>
                        {roleSortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div>Created</div>
                </div>
              )}

              {/* Roles Table Body */}
              <div>
                {getFilteredAndSortedRoles().map((role) => (
                  <div 
                    key={role.id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {window.innerWidth <= 768 ? (
                      // Mobile multi-line layout
                      <div>
                        {/* Line 1: Role Name */}
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#2d3748',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginBottom: '8px'
                        }}
                        onClick={() => handleEditRole(role)}
                        >
                          {role.name}
                        </div>
                        
                        {/* Line 2: Permissions */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {role.is_admin && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: '#28a74520',
                              color: '#28a745'
                            }}>
                              Admin
                            </span>
                          )}
                          {role.can_manage_shifts && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: '#28a74520',
                              color: '#28a745'
                            }}>
                              Shift Manager
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Desktop grid layout
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '20px'
                      }}>
                        <div 
                          style={{ 
                            fontWeight: '600', 
                            color: '#2d3748',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => handleEditRole(role)}
                        >
                          {role.name}
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: role.is_admin ? '#28a74520' : '#6c757d20',
                            color: role.is_admin ? '#28a745' : '#6c757d'
                          }}>
                            {role.is_admin ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: role.can_manage_shifts ? '#28a74520' : '#6c757d20',
                            color: role.can_manage_shifts ? '#28a745' : '#6c757d'
                          }}>
                            {role.can_manage_shifts ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {formatDate(role.created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Locations Section */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ margin: 0, color: '#2d3748', fontSize: '24px', fontWeight: 'bold' }}>
            Locations
          </h2>
          <button
            onClick={() => setShowLocationForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Add Location
          </button>
        </div>

        {/* Location Form */}
        {showLocationForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            <form onSubmit={handleLocationSubmit}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr 1fr', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({...locationFormData, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
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
                  <input
                    type="text"
                    value={locationFormData.address}
                    onChange={(e) => setLocationFormData({...locationFormData, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Type
                  </label>
                  <select
                    value={locationFormData.type}
                    onChange={(e) => setLocationFormData({...locationFormData, type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Factory">Factory</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelLocation}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>


          {locations.length === 0 ? (
            <div style={{ 
              padding: '40px 24px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              No locations found
            </div>
          ) : (
            <div>
              {/* Locations Table Header */}
              {window.innerWidth <= 768 ? (
                <div></div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 3fr 1fr',
                  gap: '20px',
                  padding: '16px 24px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2d3748'
                }}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocationSort('name')}
                  >
                    Location Name
                    {locationSortField === 'name' && (
                      <span style={{ marginLeft: '5px' }}>
                        {locationSortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocationSort('type')}
                  >
                    Type
                    {locationSortField === 'type' && (
                      <span style={{ marginLeft: '5px' }}>
                        {locationSortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocationSort('address')}
                  >
                    Address
                    {locationSortField === 'address' && (
                      <span style={{ marginLeft: '5px' }}>
                        {locationSortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div>Created</div>
                </div>
              )}

              {/* Locations Table Body */}
              <div>
                {getFilteredAndSortedLocations().map((location) => (
                  <div 
                    key={location.id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {window.innerWidth <= 768 ? (
                      // Mobile multi-line layout
                      <div>
                        {/* Line 1: Location Name */}
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#2d3748',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginBottom: '8px'
                        }}
                        onClick={() => handleEditLocation(location)}
                        >
                          {location.name}
                        </div>
                        
                        {/* Line 2: Address */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          <strong>Address:</strong> {location.address || 'N/A'}
                        </div>
                        
                        {/* Line 3: Type */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '0'
                        }}>
                          <strong>Type:</strong> {location.type || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      // Desktop grid layout
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 3fr 1fr',
                        gap: '20px'
                      }}>
                        <div 
                          style={{ 
                            fontWeight: '600', 
                            color: '#2d3748',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => handleEditLocation(location)}
                        >
                          {location.name}
                        </div>
                        <div style={{ color: '#666' }}>
                          {location.type || 'N/A'}
                        </div>
                        <div style={{ color: '#666' }}>
                          {location.address || 'N/A'}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {formatDate(location.created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RolesLocations 