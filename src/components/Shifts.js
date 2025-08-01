import React, { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const Shifts = () => {
  const { userData, tenantData } = useAuth()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortField, setSortField] = useState('start_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

  useEffect(() => {
    const fetchShifts = async () => {
      if (!tenantData?.id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch shifts data (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('posts')
          .select('*')
          .eq('tid', tenantData.id)
          .gte('start_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('start_date', { ascending: false })

        if (shiftsError) {
          console.error('Error fetching shifts:', shiftsError)
          setError('Failed to load shifts')
          return
        }

        // Fetch related data separately (optimized to reduce calls)
        const locationIds = [...new Set(shiftsData.map(shift => shift.location_id).filter(Boolean))]
        const roleIds = [...new Set(shiftsData.map(shift => shift.role_id).filter(Boolean))]
        const userIds = [...new Set([
          ...shiftsData.map(shift => shift.posted_by).filter(Boolean),
          ...shiftsData.map(shift => shift.accepted_by).filter(Boolean)
        ])]

        // Single query for all related data using IN clauses
        const [locationsResult, rolesResult, usersResult] = await Promise.all([
          locationIds.length > 0 ? supabase.from('locations').select('id, name').in('id', locationIds) : Promise.resolve({ data: [] }),
          roleIds.length > 0 ? supabase.from('roles').select('id, name').in('id', roleIds) : Promise.resolve({ data: [] }),
          userIds.length > 0 ? supabase.from('users').select('id, first_name, last_name').in('id', userIds) : Promise.resolve({ data: [] })
        ])

        // Create lookup objects
        const locationsData = {}
        locationsResult.data?.forEach(location => {
          locationsData[location.id] = location.name
        })

        const rolesData = {}
        rolesResult.data?.forEach(role => {
          rolesData[role.id] = role.name
        })

        const usersData = {}
        usersResult.data?.forEach(user => {
          usersData[user.id] = `${user.first_name} ${user.last_name}`
        })

        // Process shifts data
        const processedShifts = shiftsData.map(shift => ({
          ...shift,
          location_name: locationsData[shift.location_id] || 'No location',
          role_name: rolesData[shift.role_id] || 'No role',
          posted_by_name: usersData[shift.posted_by] || 'Unknown',
          accepted_by_name: usersData[shift.accepted_by] || 'Unassigned'
        }))

        setShifts(processedShifts)
      } catch (err) {
        console.error('Error fetching shifts:', err)
        setError('Failed to load shifts')
      } finally {
        setLoading(false)
      }
    }

    fetchShifts()
  }, [tenantData?.id])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getShiftStatus = (shift) => {
    if (!shift.start_date || !shift.start_time || !shift.end_time) {
      return { status: 'incomplete', label: 'Incomplete', color: '#ffc107' }
    }

    // Check if shift is filled or open
    if (!shift.accepted_by || shift.accepted_by.trim() === '') {
      return { status: 'open', label: 'Open', color: '#28a745' }
    } else {
      return { status: 'filled', label: 'Filled', color: '#6c757d' }
    }
  }

  const getFilteredAndSortedShifts = () => {
    if (!shifts.length) return shifts

    // First filter the shifts
    let filteredShifts = shifts.filter(shift => {
      const shiftStatus = getShiftStatus(shift)
      const matchesStatus = !statusFilter || shiftStatus.status === statusFilter
      const matchesLocation = !locationFilter || shift.location_name === locationFilter
      const matchesRole = !roleFilter || shift.role_name === roleFilter
      return matchesStatus && matchesLocation && matchesRole
    })

    // Then sort the filtered shifts
    return filteredShifts.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'start_date':
          aValue = a.start_date || ''
          bValue = b.start_date || ''
          break
        case 'start_time':
          aValue = a.start_time || ''
          bValue = b.start_time || ''
          break
        case 'description':
          aValue = a.description || ''
          bValue = b.description || ''
          break
        case 'location_name':
          aValue = a.location_name || ''
          bValue = b.location_name || ''
          break
        case 'role_name':
          aValue = a.role_name || ''
          bValue = b.role_name || ''
          break
        case 'posted_by_name':
          aValue = a.posted_by_name || ''
          bValue = b.posted_by_name || ''
          break
        case 'accepted_by_name':
          aValue = a.accepted_by_name || ''
          bValue = b.accepted_by_name || ''
          break
        case 'created_at':
          aValue = a.created_at || ''
          bValue = b.created_at || ''
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

  const getUniqueLocations = () => {
    const locations = [...new Set(shifts.map(shift => shift.location_name).filter(Boolean))]
    return locations.sort()
  }

  const getUniqueRoles = () => {
    const roles = [...new Set(shifts.map(shift => shift.role_name).filter(Boolean))]
    return roles.sort()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    // Convert to 12-hour format with AM/PM
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return 'N/A'
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
          <div style={{ fontSize: '18px', color: '#666' }}>Loading shifts...</div>
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

  const statusCounts = {
    open: shifts.filter(shift => getShiftStatus(shift).status === 'open').length,
    filled: shifts.filter(shift => getShiftStatus(shift).status === 'filled').length,
    incomplete: shifts.filter(shift => getShiftStatus(shift).status === 'incomplete').length
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '32px', fontWeight: 'bold' }}>
          Shifts
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
          Manage and view all shifts in your organization
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {/* Total Shifts - Desktop Only */}
        {window.innerWidth > 768 && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '3px solid #667eea'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '8px' 
            }}>Total Shifts</div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#2d3748' 
            }}>
              {shifts.length}
            </div>
          </div>
        )}
        
        {/* Open Shifts - Always Show */}
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
          }}>Open</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#28a745' 
          }}>
            {statusCounts.open}
          </div>
        </div>

        {/* Filled Shifts - Always Show */}
        <div style={{
          backgroundColor: 'white',
          padding: window.innerWidth <= 768 ? '16px' : '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '3px solid #6c757d'
        }}>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '12px' : '14px', 
            color: '#666', 
            marginBottom: '8px' 
          }}>Filled</div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#6c757d' 
          }}>
            {statusCounts.filled}
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
                background: 'transparent',
                border: 'none',
                fontSize: '14px',
                color: '#667eea',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
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
              <option value="open">Open</option>
              <option value="filled">Filled</option>
              <option value="incomplete">Incomplete</option>
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

          {(statusFilter || locationFilter || roleFilter) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setLocationFilter('')
                setRoleFilter('')
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

      {/* Shifts Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>


        {shifts.length === 0 ? (
          <div style={{ 
            padding: '40px 24px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            No shifts found
          </div>
        ) : (
          <div>
            {/* Table Header */}
            {window.innerWidth <= 768 ? (
              <div></div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                gap: '15px',
                padding: '16px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '14px',
                color: '#2d3748'
              }}>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('description')}
                >
                  Description
                  {sortField === 'description' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('start_date')}
                >
                  Date
                  {sortField === 'start_date' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('start_time')}
                >
                  Time
                  {sortField === 'start_time' && (
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
                  onClick={() => handleSort('posted_by_name')}
                >
                  Posted By
                  {sortField === 'posted_by_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('accepted_by_name')}
                >
                  Assigned To
                  {sortField === 'accepted_by_name' && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </div>
                <div>Status</div>
              </div>
            )}

            {/* Table Body */}
            <div>
              {getFilteredAndSortedShifts().map((shift) => {
                const status = getShiftStatus(shift)
                return (
                  <div 
                    key={shift.id}
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
                      // Mobile 2-line layout
                      <div>
                        {/* Line 1: Date, Time and Status */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            fontSize: '14px',
                            color: '#2d3748',
                            flex: 1,
                            marginRight: '12px'
                          }}>
                            <div style={{ fontWeight: '600' }}>
                              {formatDate(shift.start_date)} • {shift.start_time && shift.end_time ? 
                                `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}` : 
                                'N/A'
                              }
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: status.color + '20',
                            color: status.color,
                            flexShrink: 0
                          }}>
                            {status.label}
                          </span>
                        </div>
                        
                        {/* Line 2: Location */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          <strong>Location:</strong> {shift.location_name}
                        </div>
                        
                        {/* Line 3: Role */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          <strong>Role:</strong> {shift.role_name}
                        </div>
                        
                        {/* Line 4: Posted By */}
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          <strong>Posted By:</strong> {shift.posted_by_name}
                        </div>
                        
                        {/* Line 5: Assigned (only if filled) */}
                        {status.status === 'filled' && (
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: shift.description ? '8px' : '0'
                          }}>
                            <strong>Assigned:</strong> {shift.accepted_by_name}
                          </div>
                        )}
                        
                        {/* Line 6: Description (if exists) */}
                        {shift.description && (
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            <strong>Description:</strong> {shift.description}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Desktop grid layout
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        gap: '15px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>
                          {shift.description || 'No description'}
                        </div>
                        <div style={{ color: '#666' }}>
                          {formatDate(shift.start_date)}
                        </div>
                        <div style={{ color: '#666' }}>
                          {shift.start_time && shift.end_time ? 
                            `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}` : 
                            'N/A'
                          }
                        </div>
                        <div style={{ color: '#666' }}>
                          {shift.location_name}
                        </div>
                        <div style={{ color: '#666' }}>
                          {shift.role_name}
                        </div>
                        <div style={{ color: '#666' }}>
                          {shift.posted_by_name}
                        </div>
                        <div style={{ color: '#666' }}>
                          {status.status === 'filled' ? shift.accepted_by_name : '-'}
                        </div>
                        <div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: status.color + '20',
                            color: status.color
                          }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shifts 