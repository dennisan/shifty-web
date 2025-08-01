import React, { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const Employees = () => {
  const { userData, tenantData } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortField, setSortField] = useState('first_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [roleFilter, setRoleFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!tenantData?.id) return

      try {
        setLoading(true)
        setError(null)

        // First get users with email
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_users_with_email')
          .order('first_name', { ascending: true })

        if (usersError) {
          console.error('Error fetching users:', usersError)
          setError('Failed to load employees')
          return
        }

        // Then get role and location names for each user
        const usersWithDetails = await Promise.all(
          usersData.map(async (user) => {
            const rolePromise = user.role_id ? 
              supabase.from('roles').select('name').eq('id', user.role_id).single() : 
              Promise.resolve({ data: null })
            
            const locationPromise = user.primary_location_id ? 
              supabase.from('locations').select('name').eq('id', user.primary_location_id).single() : 
              Promise.resolve({ data: null })

            const [roleResult, locationResult] = await Promise.all([rolePromise, locationPromise])

            return {
              ...user,
              role_name: roleResult.data?.name || 'No role assigned',
              location_name: locationResult.data?.name || 'No location assigned'
            }
          })
        )

        setEmployees(usersWithDetails)
      } catch (err) {
        console.error('Error fetching employees:', err)
        setError('Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [tenantData?.id])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredAndSortedEmployees = () => {
    if (!employees.length) return employees

    // First filter the employees
    let filteredEmployees = employees.filter(employee => {
      const matchesRole = !roleFilter || employee.role_name === roleFilter
      const matchesLocation = !locationFilter || employee.location_name === locationFilter
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && employee.is_active) ||
        (statusFilter === 'inactive' && !employee.is_active)
      return matchesRole && matchesLocation && matchesStatus
    })

    // Then sort the filtered employees
    return filteredEmployees.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'first_name':
          aValue = a.first_name || ''
          bValue = b.first_name || ''
          break
        case 'last_name':
          aValue = a.last_name || ''
          bValue = b.last_name || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'role_name':
          aValue = a.role_name || ''
          bValue = b.role_name || ''
          break
        case 'location_name':
          aValue = a.location_name || ''
          bValue = b.location_name || ''
          break
        case 'is_active':
          aValue = a.is_active ? 'active' : 'inactive'
          bValue = b.is_active ? 'active' : 'inactive'
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  const getUniqueRoles = () => {
    const roles = [...new Set(employees.map(emp => emp.role_name).filter(Boolean))]
    return roles.sort()
  }

  const getUniqueLocations = () => {
    const locations = [...new Set(employees.map(emp => emp.location_name).filter(Boolean))]
    return locations.sort()
  }

  const getStatusColor = (isActive) => {
    return isActive ? '#28a745' : '#dc3545'
  }

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive'
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
          <div style={{ fontSize: '18px', color: '#666' }}>Loading employees...</div>
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
          Employees
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
          Manage your team members and their roles
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
          }}>Total Employees</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#2d3748' 
          }}>
            {employees.length}
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
          }}>Active Employees</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#28a745' 
          }}>
            {employees.filter(emp => emp.is_active).length}
          </div>
        </div>
      </div>

            {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        {/* Mobile Filter Toggle */}
        {window.innerWidth <= 768 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Filters
            </h3>
            <button 
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
              <span style={{ fontSize: '12px' }}>
                {filtersCollapsed ? '▼' : '▲'}
              </span>
            </button>
          </div>
        )}
        
        <div style={{
          display: window.innerWidth <= 768 && filtersCollapsed ? 'none' : 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Filter by Role:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Roles</option>
              {getUniqueRoles().map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Filter by Location:
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Locations</option>
              {getUniqueLocations().map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#2d3748'
            }}>
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(roleFilter || locationFilter || statusFilter) && (
            <button
              onClick={() => {
                setRoleFilter('')
                setLocationFilter('')
                setStatusFilter('')
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Employee Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>


        {employees.length === 0 ? (
          <div style={{ 
            padding: '40px 24px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            No employees found
          </div>
        ) : (
          <div>
            {/* Table Header */}
            {window.innerWidth <= 768 ? (
              <div></div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr 2fr 3fr 1fr',
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
                  onClick={() => handleSort('first_name')}
                >
                  First Name
                  {sortField === 'first_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('last_name')}
                >
                  Last Name
                  {sortField === 'last_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('email')}
                >
                  Email
                  {sortField === 'email' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('role_name')}
                >
                  Role
                  {sortField === 'role_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('location_name')}
                >
                  Location
                  {sortField === 'location_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('is_active')}
                >
                  Status
                  {sortField === 'is_active' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Table Body */}
            <div>
               {getFilteredAndSortedEmployees().map((employee) => (
                 <div 
                   key={employee.id}
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
                       {/* Line 1: Name and Status */}
                       <div style={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         alignItems: 'flex-start', 
                         marginBottom: '8px' 
                       }}>
                         <div style={{ 
                           fontSize: '16px', 
                           fontWeight: '600', 
                           color: '#2d3748' 
                         }}>
                           {employee.first_name} {employee.last_name}
                         </div>
                         <span style={{
                           padding: '4px 8px',
                           borderRadius: '12px',
                           fontSize: '12px',
                           fontWeight: '600',
                           backgroundColor: getStatusColor(employee.is_active) + '20',
                           color: getStatusColor(employee.is_active),
                           flexShrink: 0
                         }}>
                           {getStatusLabel(employee.is_active)}
                         </span>
                       </div>
                       
                       {/* Line 2: Email */}
                       <div style={{
                         fontSize: '12px',
                         color: '#666',
                         marginBottom: '4px'
                       }}>
                         <strong>Email:</strong> {employee.email}
                       </div>
                       
                       {/* Line 3: Role */}
                       <div style={{
                         fontSize: '12px',
                         color: '#666',
                         marginBottom: '4px'
                       }}>
                         <strong>Role:</strong> {employee.role_name}
                       </div>
                       
                       {/* Line 4: Location */}
                       <div style={{
                         fontSize: '12px',
                         color: '#666',
                         marginBottom: '0'
                       }}>
                         <strong>Location:</strong> {employee.location_name}
                       </div>
                     </div>
                   ) : (
                     // Desktop grid layout
                     <div style={{
                       display: 'grid',
                       gridTemplateColumns: '1fr 1fr 2fr 2fr 3fr 1fr',
                       gap: '20px'
                     }}>
                       <div style={{ fontWeight: '600', color: '#2d3748' }}>
                         {employee.first_name}
                       </div>
                       <div style={{ fontWeight: '600', color: '#2d3748' }}>
                         {employee.last_name}
                       </div>
                       <div style={{ color: '#666' }}>
                         {employee.email}
                       </div>
                       <div style={{ color: '#666' }}>
                         {employee.role_name}
                       </div>
                       <div style={{ color: '#666' }}>
                         {employee.location_name}
                       </div>
                       <div>
                         <span style={{
                           padding: '4px 8px',
                           borderRadius: '12px',
                           fontSize: '12px',
                           fontWeight: '600',
                           backgroundColor: getStatusColor(employee.is_active) + '20',
                           color: getStatusColor(employee.is_active)
                         }}>
                           {getStatusLabel(employee.is_active)}
                         </span>
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
  )
}

export default Employees 