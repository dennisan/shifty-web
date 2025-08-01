import React, { useState, useEffect, useRef } from 'react'
import { supabase, supabaseService } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const AccountBilling = ({ onNavigateToUserView }) => {
  const { userData, tenantData } = useAuth()
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [userLimitInfo, setUserLimitInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const hasFetchedPlans = useRef(false)
  const hasFetchedSubscription = useRef(false)

  useEffect(() => {
    // Only fetch subscription plans once on mount
    if (!hasFetchedPlans.current) {
      hasFetchedPlans.current = true
      fetchSubscriptionPlans()
    }
  }, [])

  useEffect(() => {
    if (tenantData?.id && !hasFetchedSubscription.current) {
      hasFetchedSubscription.current = true
      fetchCurrentSubscription()
    }
  }, [tenantData?.id])

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
        // console.log('Subscription plans:', data)
        setSubscriptionPlans(data || [])
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
    } finally {
      // No cleanup needed for this function
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true)
      console.log('Fetching current subscription...')
      
      // Use tenant data from AuthContext instead of making duplicate calls
      if (!tenantData?.id) {
        console.log('No tenant data available from AuthContext')
        setLoading(false)
        return
      }

      console.log('Tenant ID from AuthContext:', tenantData.id)

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
        .eq('tenant_id', tenantData.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // console.log('Subscription query result:', { subscription, subscriptionError })

      if (subscriptionError) {
        console.log('No active subscription found:', subscriptionError.message)
      } else {
        console.log('Current subscription:', subscription)
        setCurrentSubscription(subscription)
        
        // If we have a subscription, fetch user limit info
        if (subscription) {
          fetchUserLimitInfo(tenantData.id)
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
      
      // console.log('User limit info result:', { data, error })
      
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
    } finally {
      // No cleanup needed for this function
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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading subscription plans...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '32px', fontWeight: 'bold' }}>
          Account & Billing
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
          Manage your subscription and billing information
        </p>
      </div>




      
      {/* Current Subscription Status */}
      {currentSubscription && (
        <div style={{ 
          marginBottom: '32px',
          padding: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold' }}>Current Subscription</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Plan</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                {currentSubscription.stripe_products?.name || 'N/A'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Status</div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: getStatusColor(currentSubscription.status)
              }}>
                {getStatusLabel(currentSubscription.status)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Billing Cycle</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                {currentSubscription.billing_interval === 'month' ? 'Monthly' : 'Yearly'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Current Period</div>
              <div style={{ fontSize: '14px', color: 'white' }}>
                {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
              </div>
            </div>
            
            {userLimitInfo && (
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Plan Limit</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#ffd700'
                }}>
                  {userLimitInfo.plan_limit} users
                </div>
              </div>
            )}
            
            {userLimitInfo && (
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>Active Users</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: userLimitInfo.is_within_limit ? '#90EE90' : '#FFB6C1'
                }}>
                  {userLimitInfo.active_count}
                </div>
              </div>
            )}
            

            
            {currentSubscription.cancel_at_period_end && (
              <div style={{ 
                gridColumn: '1 / -1',
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '5px',
                color: 'white'
              }}>
                ⚠️ This subscription will be canceled at the end of the current billing period.
              </div>
            )}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          fontSize: '120px',
          opacity: 0.1,
          zIndex: 1
        }}>
          💎
        </div>
      </div>
      )}



      {/* Subscription Plans Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.stripe_product_id}
            style={{
              border: plan.is_popular ? '3px solid #667eea' : '3px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              backgroundColor: 'white',
              position: 'relative',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              transform: selectedPlan?.stripe_product_id === plan.stripe_product_id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedPlan?.stripe_product_id === plan.stripe_product_id ? '0 6px 12px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
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


    </div>
  )
}

export default AccountBilling 