'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { getMenuItems, createCustomer, createOrder } from '@/lib/api'
import { PrintService } from '@/lib/printService'

// 🔍 DEBUG COMPONENT - TEMPORARY
const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState('')
  
  const runDebugTest = () => {
    const info = []
    info.push('=== PDA DEBUG INFO ===')
    info.push(`Hostname: ${window.location.hostname}`)
    info.push(`User Agent: ${navigator.userAgent.substring(0, 50)}...`)
    info.push('')
    
    // Check for printer bridges
    const bridges = [
      'Android', 'printer', 'device', 'sunmi', 
      'newland', 'urovo', 'citaq', 'pos'
    ]
    
    bridges.forEach(bridge => {
      const exists = !!window[bridge]
      const hasFunc = window[bridge]?.printText || window[bridge]?.print
      info.push(`${bridge}: ${exists ? '✅' : '❌'} ${hasFunc ? '(has print)' : ''}`)
    })
    
    info.push('')
    info.push('Available window properties:')
    const props = Object.keys(window).filter(key => 
      key.toLowerCase().includes('print') || 
      key.toLowerCase().includes('android') ||
      key.toLowerCase().includes('device')
    )
    info.push(props.join(', ') || 'None found')
    
    // Test PrintService detection
    info.push('')
    info.push(`PrintService.isAndroidPDA(): ${PrintService.isAndroidPDA()}`)
    
    setDebugInfo(info.join('\n'))
  }
  
  const testPrint = () => {
    const testData = {
      id: 'DEBUG-001',
      customerName: 'Debug Test',
      customerPhone: '09123456789',
      items: [{ name: 'Test Item', quantity: 1, price: 50 }],
      total: 50
    }
    
    alert('🔍 Testing print... Check console and watch for alerts!')
    PrintService.printReceipt(testData)
  }
  
  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">🔍 Debug Mode (Remove Later)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={runDebugTest} size="sm" variant="outline">
            Check PDA Info
          </Button>
          <Button onClick={testPrint} size="sm" variant="outline">
            Test Print
          </Button>
        </div>
        
        {debugInfo && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {debugInfo}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrderPage() {
  const [mounted, setMounted] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" })
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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
    if (newQuantity <= 0) return removeFromCart(itemId)
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const submitOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!customer.name || !customer.phone) throw new Error('Customer information is incomplete')
      if (!cart.length) throw new Error('Cart is empty')

      const customerData = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null
      }

      const customerResponse = await createCustomer(customerData)

      const orderData = {
        customer_id: customerResponse.id,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: calculateTotal(),
        status: 'pending'
      }

      const orderResponse = await createOrder(orderData)

      // 🖨️ AUTOMATIC RECEIPT PRINTING
      const receiptData = {
        id: orderResponse.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal()
      }
      
      // Print receipt automatically
      console.log('🖨️ Printing receipt for order:', orderResponse.id)
      await PrintService.printReceipt(receiptData)

      // 🚀 AUTOMATIC REDIRECT TO TRACK ORDER PAGE
      // Instead of showing success screen, redirect immediately
      router.push(`/track-order?orderId=${orderResponse.id}`)
      
      // Reset form state
      setCart([])
      setCustomer({ name: "", phone: "", email: "" })
      
    } catch (error) {
      console.error('❌ Error creating order:', error)
      alert(`Failed to place order: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* 🔍 DEBUG COMPONENT - TEMPORARY */}
        <DebugInfo />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Your Order</h1>
          <p className="text-gray-600">Select items from our menu and provide your details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Menu Items
                </CardTitle>
                <CardDescription>Select items to add to your cart</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4"
                />
                {loading ? (
                  <p>Loading menu items...</p>
                ) : (
                  <div className="grid gap-4">
                    {menuItems
                      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                      .map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex gap-4">
                            {/* ✅ Menu image using item.image_url */}
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">₱{item.price}</Badge>
                                {item.category && <Badge>{item.category}</Badge>}
                              </div>
                            </div>
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              disabled={!item.available}
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

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">₱{item.price} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₱{calculateTotal()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <form onSubmit={submitOrder} className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
              <Button type="submit" className="w-full" disabled={submitting || cart.length === 0}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}