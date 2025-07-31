import React, { useState, useEffect } from 'react'
import { supabase, supabaseService } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const Dashboard = ({ onNavigateToUserView }) => {
  const { signOut, userData, tenantData } = useAuth()
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [userLimitInfo, setUserLimitInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    fetchSubscriptionPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('is_active', true)
        .eq('is_trial', false)
        .order('price_cents_monthly', { ascending: true })

      if (error) {
        console.error('Error fetching subscription plans:', error)
      } else {
        console.log('Subscription plans:', data)
        setSubscriptionPlans(data || [])
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true)
      console.log('Fetching current subscription...')
      
      // Get the current user's tenant_id from userData
      const { data: userData } = await supabase.auth.getUser()
      console.log('User data:', userData)
      
      if (!userData?.user) {
        console.log('No user data found')
        setLoading(false)
        return
      }

      // Get user's tenant information
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('tid')
        .eq('id', userData.user.id)
        .single()

      console.log('User info:', userInfo, 'User error:', userError)

      if (userError || !userInfo?.tid) {
        console.log('No tenant found for user')
        setLoading(false)
        return
      }

      console.log('Tenant ID:', userInfo.tid)

      // Get current subscription for the tenant using service role
      const { data: subscription, error: subscriptionError } = await supabaseService
        .from('tenant_subscriptions')
        .select(`
          *,
          stripe_products (
            name,
            description
          )
        `)
        .eq('tenant_id', userInfo.tid)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      console.log('Subscription query result:', { subscription, subscriptionError })

      if (subscriptionError) {
        console.log('No active subscription found:', subscriptionError.message)
      } else {
              console.log('Current subscription:', subscription)
      setCurrentSubscription(subscription)
      
      // If we have a subscription, fetch user limit info
      if (subscription) {
        fetchUserLimitInfo(userInfo.tid)
      }
    }
  } catch (error) {
    console.error('Error fetching current subscription:', error)
  } finally {
    setLoading(false)
  }
}

const fetchUserLimitInfo = async (tenantId) => {
  try {
    console.log('Fetching user limit info for tenant:', tenantId)
    
    const { data, error } = await supabaseService
      .rpc('check_tenant_user_limit', { tenant_uuid: tenantId })
    
    console.log('User limit info result:', { data, error })
    
    if (error) {
      console.error('Error fetching user limit info:', error)
    } else if (data && data.length > 0) {
      const info = data[0]
      console.log('User limit info:', info)
      setUserLimitInfo({
        active_count: info.active_user_count,
        total_count: info.total_user_count,
        plan_limit: info.plan_user_limit,
        is_within_limit: info.is_within_limit
      })
    } else {
      console.log('No user limit data returned')
    }
  } catch (error) {
    console.error('Error fetching user limit info:', error)
  }
}

  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#28a745'
      case 'trialing':
        return '#17a2b8'
      case 'past_due':
        return '#ffc107'
      case 'canceled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Past Due'
      case 'canceled':
        return 'Canceled'
      case 'incomplete':
        return 'Incomplete'
      default:
        return status
    }
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
  }

  const handleSubscribe = async (plan) => {
    // TODO: Implement subscription logic
    console.log('Subscribing to plan:', plan)
    alert(`Subscribing to ${plan.name}`)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading subscription plans...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {tenantData?.name || 'Tenant'}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Welcome, {userData?.first_name} {userData?.last_name}
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h1>Choose Your Subscription Plan</h1>
        <p>Select the plan that best fits your needs</p>
      </div>



      {/* Current Subscription Status */}
      {currentSubscription && (
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Current Subscription</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Plan</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                {currentSubscription.stripe_products?.name || 'N/A'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Status</div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: getStatusColor(currentSubscription.status)
              }}>
                {getStatusLabel(currentSubscription.status)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Billing Cycle</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {currentSubscription.billing_interval === 'month' ? 'Monthly' : 'Yearly'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Current Period</div>
              <div style={{ fontSize: '14px', color: '#333' }}>
                {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
              </div>
            </div>
            
            {userLimitInfo && (
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Plan Limit</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#007bff'
                }}>
                  {userLimitInfo.plan_limit} users
                </div>
              </div>
            )}
            
            {userLimitInfo && (
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Active Users</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: userLimitInfo.is_within_limit ? '#28a745' : '#dc3545'
                }}>
                  {userLimitInfo.active_count}
                </div>
              </div>
            )}
            

            
            {currentSubscription.cancel_at_period_end && (
              <div style={{ 
                gridColumn: '1 / -1',
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '5px',
                color: '#856404'
              }}>
                ⚠️ This subscription will be canceled at the end of the current billing period.
              </div>
            )}
          </div>
        </div>
      )}



      {/* Subscription Plans Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.stripe_product_id}
            style={{
              border: plan.is_popular ? '2px solid #007bff' : '1px solid #dee2e6',
              borderRadius: '10px',
              padding: '25px',
              backgroundColor: 'white',
              position: 'relative',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              transform: selectedPlan?.stripe_product_id === plan.stripe_product_id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedPlan?.stripe_product_id === plan.stripe_product_id ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)'
            }}
            onClick={() => handlePlanSelect(plan)}
          >
            {/* Popular Badge */}
            {plan.is_popular && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Most Popular
              </div>
            )}

            {/* Trial Badge */}
            {plan.is_trial && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                Trial
              </div>
            )}

            {/* Plan Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{plan.name}</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{plan.description}</p>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: '15px'
              }}>
                {/* Monthly Price */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                    {formatPrice(plan.price_cents_monthly)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    per month
                  </div>
                </div>
                
                {/* Divider */}
                <div style={{ 
                  width: '1px', 
                  height: '30px', 
                  backgroundColor: '#dee2e6' 
                }}></div>
                
                {/* Yearly Price */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    {formatPrice(plan.price_cents_yearly)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    per year
                  </div>
                </div>
              </div>
            </div>



            {/* Subscribe Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSubscribe(plan)
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: selectedPlan?.stripe_product_id === plan.stripe_product_id ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0056b3'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = selectedPlan?.stripe_product_id === plan.stripe_product_id ? '#28a745' : '#007bff'
              }}
            >
              {selectedPlan?.stripe_product_id === plan.stripe_product_id ? 'Selected' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={onNavigateToUserView}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to User View
        </button>
      </div>
    </div>
  )
}

export default Dashboard 