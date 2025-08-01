'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { getMenuItems, createCustomer, createOrder } from '@/lib/api'

export default function OrderPage() {
  // State declarations
  const [mounted, setMounted] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" })
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydration fix
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load menu items
  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems()
      setMenuItems(items)
    } catch (error) {
      console.error('Failed to load menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cart functions
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

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Your exact submitOrder function with debug logging
  const submitOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    console.log('=== ORDER SUBMISSION DEBUG START ===');
    
    try {
      // Log the form data before processing
      console.log('Form data before processing:', {
        customer: customer,
        cart: cart,
        totalAmount: calculateTotal(),
      });

      // Step 1: Validate required data
      if (!customer || !customer.name || !customer.phone) {
        throw new Error('Customer information is incomplete');
      }

      if (!cart || cart.length === 0) {
        throw new Error('Cart is empty');
      }

      console.log('✅ Data validation passed');

      // Step 2: Prepare customer data
      const customerData = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null
      };

      console.log('Customer data prepared:', customerData);

      // Step 3: Create or get customer
      console.log('Creating customer...');
      const customerResponse = await createCustomer(customerData);
      console.log('✅ Customer created/retrieved:', customerResponse);

      // Step 4: Prepare order items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      console.log('Order items prepared:', orderItems);

      // Step 5: Prepare order data
      const orderData = {
        customer_id: customerResponse.id,
        items: orderItems,
        total_amount: calculateTotal(),
        status: 'pending'
      };

      console.log('Order data prepared:', orderData);

      // Step 6: Create order
      console.log('Creating order...');
      const orderResponse = await createOrder(orderData);
      console.log('✅ Order created successfully:', orderResponse);

      // Step 7: Success handling
      setOrderId(orderResponse.id)
      setOrderComplete(true)
      setCart([])
      setCustomer({ name: "", phone: "", email: "" })

    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      // Detailed error logging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Check if it's a network error
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        console.error('🌐 This appears to be a network/API error');
        console.error('Check if your API routes exist and are working');
        console.error('Expected API endpoint:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/orders`);
      }

      // Show user-friendly error message
      alert(`Failed to place order: ${error.message}`)
    } finally {
      setSubmitting(false)
      console.log('=== ORDER SUBMISSION DEBUG END ===');
    }
  }

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return null
  }

  // Order complete screen
  if (orderComplete) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Order Placed Successfully!</CardTitle>
            <CardDescription className="text-green-600">
              Your order #{orderId} has been received and is being prepared.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              You will receive updates about your order status.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.location.href = `/track-order?id=${orderId}`}
                className="flex-1"
              >
                Track Your Order
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setOrderComplete(false)
                  setOrderId(null)
                }}
                className="flex-1"
              >
                Place Another Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Your Order</h1>
          <p className="text-gray-600">Select items from our menu and provide your details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Menu Items
                </CardTitle>
                <CardDescription>
                  Select items to add to your cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading menu items...</p>
                    </div>
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No menu items available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {menuItems.map((item) => (
                      <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-lg font-medium">
                                ₱{item.price}
                              </Badge>
                              <Badge 
                                variant={item.available ? "default" : "destructive"}
                              >
                                {item.available ? "Available" : "Out of Stock"}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline">{item.category}</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                            size="sm"
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart and Order Section - Takes 1 column */}
          <div className="space-y-6">
            {/* Cart */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add items from the menu</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">₱{item.price} each</p>
                          <p className="text-sm font-medium text-gray-800">
                            Subtotal: ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-xl">₱{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>
                    Please provide your details to complete the order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitOrder} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={customer.email}
                        onChange={(e) => setCustomer({...customer, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting || cart.length === 0}
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Placing Order...
                        </>
                      ) : (
                        `Place Order - ₱${calculateTotal().toFixed(2)}`
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}