// Dynamic API URL that works from both localhost and PDA
const getApiBaseUrl = () => {
  // If we have an environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Otherwise, build URL dynamically based on current location
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    return `${protocol}//${hostname}:${port}/api`
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:3000/api'
}

const API_BASE_URL = getApiBaseUrl()

// Debug logging
console.log('🔧 API Base URL:', API_BASE_URL)

// Get all menu items
export const getMenuItems = async () => {
  try {
    const url = `${API_BASE_URL}/menu`
    console.log('🔍 Fetching menu from:', url)
    
    const response = await fetch(url)
    console.log('📡 Menu API response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Menu API success:', result)
    return result.success ? result.data : result
  } catch (error) {
    console.error('❌ Error fetching menu items:', error)
    throw error
  }
}

// Create or get existing customer
export const createCustomer = async (customerData) => {
  try {
    const url = `${API_BASE_URL}/customer`
    console.log('🔍 Creating customer at:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    })
    
    console.log('📡 Customer API response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Customer API success:', result)
    return result.success ? result.data : result
  } catch (error) {
    console.error('❌ Error creating customer:', error)
    throw error
  }
}

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const url = `${API_BASE_URL}/orders`
    console.log('🔍 Creating order at:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    
    console.log('📡 Order API response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Order API success:', result)
    return result.success ? result.data : result
  } catch (error) {
    console.error('❌ Error creating order:', error)
    throw error
  }
}

// Get order by ID
export const getOrder = async (orderId) => {
  try {
    const url = `${API_BASE_URL}/orders/${orderId}`
    console.log('🔍 Fetching order from:', url)
    
    const response = await fetch(url)
    console.log('📡 Get order response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Get order success:', result)
    return result
  } catch (error) {
    console.error('❌ Error fetching order:', error)
    throw error
  }
}

// Get all orders (for admin/staff)
export const getOrders = async () => {
  try {
    const url = `${API_BASE_URL}/orders`
    console.log('🔍 Fetching orders from:', url)
    
    const response = await fetch(url)
    console.log('📡 Get orders response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Get orders success:', result)
    return result
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    throw error
  }
}

// Update order status - FIXED VERSION WITH BETTER DEBUGGING
export const updateOrderStatus = async (orderId, status) => {
  console.log('🔄 updateOrderStatus called:', { orderId, status })
  
  try {
    const url = `${API_BASE_URL}/orders?id=${orderId}`
    console.log('Making PATCH request to:', url)
    console.log('Request body:', { status })
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    
    console.log('Response status:', response.status)
    console.log('Response OK:', response.ok)
    console.log('Response URL:', response.url)
    
    // Get response text first to see what we're actually getting
    const responseText = await response.text()
    console.log('Raw response text (first 200 chars):', responseText.substring(0, 200))
    
    // Check if response is HTML (error page)
    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      console.error('❌ Received HTML instead of JSON. Full response:', responseText)
      throw new Error(`API returned HTML instead of JSON. This usually means the endpoint doesn't exist or there's a server error. Status: ${response.status}`)
    }
    
    // Try to parse as JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError)
      console.error('Response text was:', responseText)
      throw new Error(`Invalid JSON response: ${responseText}`)
    }
    
    if (!response.ok) {
      console.error('❌ HTTP error:', result)
      throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`)
    }
    
    console.log('✅ updateOrderStatus success:', result)
    return result
  } catch (error) {
    console.error('❌ Error updating order status:', error)
    throw error
  }
}