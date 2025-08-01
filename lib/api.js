const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Get all menu items
export const getMenuItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`)
    if (!response.ok) {
      throw new Error('Failed to fetch menu items')
    }
    const result = await response.json()
    // Handle the { success: true, data: [...] } format
    return result.success ? result.data : result
  } catch (error) {
    console.error('Error fetching menu items:', error)
    throw error
  }
}

// Create or get existing customer
export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create customer')
    }
    
    const result = await response.json()
    // Handle the { success: true, data: {...} } format
    return result.success ? result.data : result
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create order')
    }
    
    const result = await response.json()
    // Handle the { success: true, data: {...} } format
    return result.success ? result.data : result
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Additional helper functions you might need

// Get order by ID
export const getOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch order')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

// Get all orders (for admin/staff)
export const getOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`)
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update order status')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}