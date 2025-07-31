import React, { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const UserView = ({ onNavigateToDashboard }) => {
  const { user, userData, tenantData, signOut } = useAuth()
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [sortField, setSortField] = useState('start_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [locationFilter, setLocationFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [acceptedByFilter, setAcceptedByFilter] = useState('')

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredAndSortedPosts = () => {
    if (!posts.length) return posts

    // First filter the posts
    let filteredPosts = posts.filter(post => {
      const matchesLocation = !locationFilter || post.locationName === locationFilter
      const matchesRole = !roleFilter || post.roleName === roleFilter
      const matchesAcceptedBy = !acceptedByFilter || post.acceptedUserName === acceptedByFilter
      return matchesLocation && matchesRole && matchesAcceptedBy
    })

    // Then sort the filtered posts
    return filteredPosts.sort((a, b) => {
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
        case 'roleName':
          aValue = a.roleName || ''
          bValue = b.roleName || ''
          break
        case 'locationName':
          aValue = a.locationName || ''
          bValue = b.locationName || ''
          break
        case 'acceptedUserName':
          aValue = a.acceptedUserName || ''
          bValue = b.acceptedUserName || ''
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
    const locations = [...new Set(posts.map(post => post.locationName).filter(Boolean))]
    return locations.sort()
  }

  const getUniqueRoles = () => {
    const roles = [...new Set(posts.map(post => post.roleName).filter(Boolean))]
    return roles.sort()
  }

  const getUniqueAcceptedBy = () => {
    const acceptedBy = [...new Set(posts.map(post => post.acceptedUserName).filter(Boolean))]
    const sortedAcceptedBy = acceptedBy.sort()
    // Move "Not Accepted" to the top if it exists
    const notAcceptedIndex = sortedAcceptedBy.indexOf('Not Accepted')
    if (notAcceptedIndex > -1) {
      sortedAcceptedBy.splice(notAcceptedIndex, 1)
      return ['Not Accepted', ...sortedAcceptedBy]
    }
    return sortedAcceptedBy
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getUserRole = () => {
    if (!userData?.roles) return 'N/A'
    return userData.roles.name
  }

  const getUserLocation = () => {
    if (!userData?.locations) return 'N/A'
    return userData.locations.name
  }

  const getUserFullName = () => {
    const firstName = userData?.first_name || ''
    const lastName = userData?.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || 'N/A'
  }

  // Fetch posts posted by the user
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userData?.id) {
        console.log('No userData.id available, skipping posts fetch')
        return
      }
      
      const userId = userData.id.toLowerCase()
      console.log('Fetching posts for user ID:', userId)
      setLoadingPosts(true)
      
      try {
        // First, let's check what posts exist in the database
        const { data: allPosts, error: allPostsError } = await supabase
          .from('posts')
          .select('*')
          .limit(5)
        
        console.log('All posts in database:', allPosts)
        console.log('All posts error:', allPostsError)

        // Now fetch posts for this specific user - just basic data first
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('posted_by', userId)
          .order('start_date', { ascending: false })

        console.log('Posts query result:', { data, error })
        console.log('User ID being searched:', userId)

        if (error) {
          console.error('Error fetching posts:', error)
        } else {
          console.log('Posts found for user:', data)
          
          // Fetch role and location names for each post
          if (data && data.length > 0) {
            const postsWithNames = await Promise.all(
              data.map(async (post) => {
                let roleName = 'N/A'
                let locationName = 'N/A'
                let acceptedUserName = 'Not Accepted'

                // Fetch role name if role_id exists
                if (post.role_id) {
                  const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('name')
                    .eq('id', post.role_id)
                    .single()
                  
                  if (!roleError && roleData) {
                    roleName = roleData.name
                  }
                }

                // Fetch location name if location_id exists
                if (post.location_id) {
                  const { data: locationData, error: locationError } = await supabase
                    .from('locations')
                    .select('name')
                    .eq('id', post.location_id)
                    .single()
                  
                  if (!locationError && locationData) {
                    locationName = locationData.name
                  }
                }

                // Fetch accepted user name if accepted_by exists
                if (post.accepted_by) {
                  const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('first_name, last_name')
                    .eq('id', post.accepted_by)
                    .single()
                  
                  if (!userError && userData) {
                    const firstName = userData.first_name || ''
                    const lastName = userData.last_name || ''
                    acceptedUserName = `${firstName} ${lastName}`.trim() || 'Unknown User'
                  }
                }

                return {
                  ...post,
                  roleName,
                  locationName,
                  acceptedUserName
                }
              })
            )
            
            setPosts(postsWithNames)
          } else {
            setPosts(data || [])
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchPosts()
  }, [userData?.id])

  const getAcceptedUserName = (acceptedUser) => {
    if (!acceptedUser) return 'Not Accepted'
    const firstName = acceptedUser.first_name || ''
    const lastName = acceptedUser.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || 'Unknown User'
  }

  const formatShiftDateTime = (post) => {
    const startDate = post.start_date
    const endDate = post.end_date
    const startTime = post.start_time
    const endTime = post.end_time
    
    if (!startDate || !endDate) return 'N/A'
    
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`
    const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : 'N/A'
    
    return `${dateRange} ${timeRange}`
  }

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortTime = (timeString) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  const formatShiftDate = (post) => {
    const startDate = post.start_date
    const endDate = post.end_date
    
    if (!startDate) return 'N/A'
    
    if (startDate === endDate) {
      return formatShortDate(startDate)
    } else {
      return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
    }
  }

  const formatShiftTime = (post) => {
    const startTime = post.start_time
    const endTime = post.end_time
    
    if (!startTime || !endTime) return 'N/A'
    
    return `${startTime} - ${endTime}`
  }

  // If user data is null, show a message for new users
  if (!userData) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <h2>Welcome to QwikShift</h2>
          </div>
          
          <div className="dashboard-content">
            <div className="info-section">
              <h3>👤 User Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>User ID:</label>
                  <span className="user-id">{user?.id || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-pending">Pending Setup</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>📋 Account Setup</h3>
              <div className="setup-message">
                <p>Your account has been created successfully! However, your user profile has not been set up in the system yet.</p>
                <p>Please contact your administrator to complete your account setup.</p>
              </div>
            </div>

            <div className="info-section">
              <h3>📅 Session Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Last Sign In:</label>
                  <span>{formatDate(user?.last_sign_in_at)}</span>
                </div>
                <div className="info-item">
                  <label>Account Created:</label>
                  <span>{formatDate(user?.created_at)}</span>
                </div>
                <div className="info-item">
                  <label>Email Confirmed:</label>
                  <span className={user?.email_confirmed_at ? 'status-confirmed' : 'status-pending'}>
                    {user?.email_confirmed_at ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button 
              onClick={handleSignOut}
              className="sign-out-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Welcome to QwikShift!</h2>
        </div>
        
        <div className="dashboard-content">
          <div className="info-section">
            <h3>👤 User & Tenant Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{getUserFullName()}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span>{getUserRole()}</span>
              </div>
              <div className="info-item">
                <label>Location:</label>
                <span>{getUserLocation()}</span>
              </div>
              <div className="info-item">
                <label>Tenant Name:</label>
                <span>{tenantData?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Tenant Address:</label>
                <span>{tenantData?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>📝 Your Posts</h3>
            <div className="posts-filters">
              <div className="filter-group">
                <label htmlFor="location-filter">Filter by Location:</label>
                <select
                  id="location-filter"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="role-filter">Filter by Role:</label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Roles</option>
                  {getUniqueRoles().map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="accepted-by-filter">Filter by Accepted By:</label>
                <select
                  id="accepted-by-filter"
                  value={acceptedByFilter}
                  onChange={(e) => setAcceptedByFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Accepted By</option>
                  {getUniqueAcceptedBy().map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {(locationFilter || roleFilter || acceptedByFilter) && (
                <button
                  onClick={() => {
                    setLocationFilter('')
                    setRoleFilter('')
                    setAcceptedByFilter('')
                  }}
                  className="clear-filters-button"
                >
                  Clear
                </button>
              )}
            </div>
            {loadingPosts ? (
              <div className="loading-posts">Loading posts...</div>
            ) : posts.length > 0 ? (
              <div className="posts-table">
                <div className="posts-header">
                  <div 
                    className="post-col sortable" 
                    onClick={() => handleSort('start_date')}
                  >
                    Shift Date
                    {sortField === 'start_date' && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    className="post-col sortable" 
                    onClick={() => handleSort('start_time')}
                  >
                    Shift Time
                    {sortField === 'start_time' && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    className="post-col sortable" 
                    onClick={() => handleSort('roleName')}
                  >
                    Role
                    {sortField === 'roleName' && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    className="post-col sortable" 
                    onClick={() => handleSort('locationName')}
                  >
                    Location
                    {sortField === 'locationName' && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                  <div 
                    className="post-col sortable" 
                    onClick={() => handleSort('acceptedUserName')}
                  >
                    Accepted By
                    {sortField === 'acceptedUserName' && (
                      <span className="sort-indicator">
                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="posts-body">
                  {getFilteredAndSortedPosts().map((post) => (
                    <div key={post.id} className="post-row">
                      <div className="post-col">{formatShiftDate(post)}</div>
                      <div className="post-col">{formatShiftTime(post)}</div>
                      <div className="post-col">{post.roleName || 'N/A'}</div>
                      <div className="post-col">{post.locationName || 'N/A'}</div>
                      <div className="post-col">
                        <span className={post.accepted_by ? 'status-active' : 'status-pending'}>
                          {post.acceptedUserName || 'Not Accepted'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-posts">
                <p>No posts found. You haven't posted any shifts yet.</p>
                <p>User ID: {userData.id}</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-actions">
          <button 
            onClick={onNavigateToDashboard}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleSignOut}
            className="sign-out-button"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserView 