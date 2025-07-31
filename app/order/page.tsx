"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getMenuItems, createCustomer, createOrder } from "@/lib/api"

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState([]) // Always initialize as array
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [error, setError] = useState(null) // Add error state

  // Load menu items on component mount
  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setError(null)
      const items = await getMenuItems()
      
      // Ensure we always get an array
      if (Array.isArray(items)) {
        setMenuItems(items)
      } else if (items && Array.isArray(items.data)) {
        setMenuItems(items.data) // In case API returns { data: [...] }
      } else {
        console.error("API returned non-array data:", items)
        setMenuItems([]) // Fallback to empty array
        setError("Invalid menu data received from server")
      }
    } catch (error) {
      console.error("Error loading menu:", error)
      setMenuItems([]) // Ensure it's always an array even on error
      setError(`Failed to load menu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Group menu items by category - with safety check
  const groupedItems = Array.isArray(menuItems) ? menuItems.reduce((groups, item) => {
    const category = item.category || "Other"
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {}) : {}

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      return prevCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: Math.max(0, cartItem.quantity - 1) }
          : cartItem
      ).filter(cartItem => cartItem.quantity > 0)
    })
  }

  // Get item quantity in cart
  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Submit order
  const submitOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create or get customer
      const customerData = await createCustomer({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null
      })

      // Prepare order items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))

      // Create order
      const orderData = await createOrder({
        customer_id: customerData.id,
        items: orderItems,
        total_amount: calculateTotal(),
        status: 'pending'
      })

      setOrderId(orderData.id)
      setOrderComplete(true)
      setCart([])
      setCustomer({ name: "", phone: "", email: "" })

    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error creating order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Reset to place new order
  const placeNewOrder = () => {
    setOrderComplete(false)
    setOrderId(null)
  }

  // Add client-side only state to prevent hydration issues
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alfamart-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  // Show error state if there's an error and no menu items
  if (error && menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Error Loading Menu</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={loadMenuItems}
              className="w-full bg-alfamart-red hover:bg-alfamart-red-dark"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Your order #{orderId} has been placed successfully.</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500 inline mr-2" />
              <span className="text-blue-700">Estimated pickup time: 15-20 minutes</span>
            </div>
            <p className="text-sm text-gray-500">
              We'll prepare your order and notify you when it's ready for pickup.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={placeNewOrder}
                className="w-full bg-alfamart-red hover:bg-alfamart-red-dark"
              >
                Place Another Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/ready-board'
                  }
                }}
              >
                View Pickup Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-alfamart-red mb-2">Place Your Order</h1>
          <p className="text-gray-600">Select items from our menu and place your pickup order</p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {Object.keys(groupedItems).length === 0 ? (
              <Card className="bg-white shadow-md">
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No menu items available at the moment.</p>
                  <Button 
                    onClick={loadMenuItems}
                    className="mt-4 bg-alfamart-red hover:bg-alfamart-red-dark"
                  >
                    Refresh Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-semibold text-alfamart-blue mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <Card key={item.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <Badge variant={item.available ? "default" : "secondary"}>
                                {item.available ? "Available" : "Out of Stock"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-alfamart-red">
                                ₱{parseFloat(item.price).toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  disabled={!item.available || getItemQuantity(item.id) === 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold">
                                  {getItemQuantity(item.id)}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  disabled={!item.available}
                                  className="bg-alfamart-red hover:bg-alfamart-red-dark"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart and Customer Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Your Order ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">₱{parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 font-bold text-lg border-t">
                      <span>Total:</span>
                      <span className="text-alfamart-red">₱{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Customer Information Form */}
                {cart.length > 0 && (
                  <form onSubmit={submitOrder} className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Customer Information</h3>
                    
                    <div>
                      <Label htmlFor="customerName">Name *</Label>
                      <Input
                        id="customerName"
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        required
                        placeholder="09XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerEmail">Email (Optional)</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-alfamart-red hover:bg-alfamart-red-dark"
                      disabled={submitting || cart.length === 0}
                    >
                      {submitting ? "Placing Order..." : `Place Order - ₱${calculateTotal().toFixed(2)}`}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}