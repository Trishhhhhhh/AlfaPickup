"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, Clock, CheckCircle, Phone, ArrowLeft } from 'lucide-react'
import { getOrders } from '@/lib/api' // Use your existing API function

interface Order {
  id: string
  orderNumber?: string
  status: string
  total_amount: number
  created_at: string
  customers?: {
    name: string
    phone: string
    email?: string
  }
  customerName?: string
  customerPhone?: string
  items?: any[]
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [foundOrder, setFoundOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoLoading, setAutoLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get order ID from URL parameters
  const orderIdFromUrl = searchParams.get('orderId')
  const orderNumberFromUrl = searchParams.get('orderNumber')

  // Search function that can be used for both auto and manual search
  const searchForOrder = async (searchOrderId: string, isAutoSearch = false) => {
    if (!searchOrderId.trim()) {
      if (isAutoSearch) setAutoLoading(false)
      else setError('Please enter an order number')
      return
    }

    if (isAutoSearch) {
      setAutoLoading(true)
    } else {
      setLoading(true)
    }
    
    setError('')
    setFoundOrder(null)

    try {
      const response = await getOrders()
      console.log('API response:', response)
      
      const allOrders = response.success ? response.data : response
      
      if (!Array.isArray(allOrders)) {
        throw new Error('Invalid response format from API')
      }

      console.log('All orders:', allOrders)
      
      // Search for the order by order number or ID
      const orderNum = searchOrderId.trim().toLowerCase()
      const order = allOrders.find((o: Order) => {
        const matchOrderNumber = o.orderNumber?.toLowerCase() === orderNum
        const matchId = o.id?.toLowerCase().includes(orderNum)
        const matchShortId = o.id?.substring(0, 4).toLowerCase() === orderNum
        
        return matchOrderNumber || matchId || matchShortId
      })

      console.log('Found order:', order)
      
      if (order) {
        setFoundOrder(order)
        // Update URL to include the order ID for future reference (only for manual search)
        if (!isAutoSearch) {
          const newUrl = `/track-order?orderId=${order.id}`
          window.history.replaceState({}, '', newUrl)
        }
      } else {
        setError('Order not found. Please check your order number and try again.')
      }
    } catch (err) {
      console.error('Error searching for order:', err)
      setError('Failed to search for order. Please try again.')
    } finally {
      if (isAutoSearch) {
        setAutoLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Auto-load order on component mount if order ID is provided
  useEffect(() => {
    const autoOrderId = orderIdFromUrl || orderNumberFromUrl
    if (autoOrderId) {
      setOrderNumber(autoOrderId)
      searchForOrder(autoOrderId, true)
    }
  }, [orderIdFromUrl, orderNumberFromUrl])

  const handleSearch = () => {
    searchForOrder(orderNumber, false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-blue-500', text: 'New Order', icon: Package },
      preparing: { color: 'bg-orange-500', text: 'Preparing', icon: Clock },
      ready: { color: 'bg-green-500', text: 'Ready for Pickup', icon: CheckCircle },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      color: 'bg-gray-500',
      text: status,
      icon: Package
    }
    
    const Icon = statusInfo.icon
    
    return (
      <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
        <Icon className="w-4 h-4 mr-1" />
        {statusInfo.text}
      </Badge>
    )
  }

  const formatOrderItems = (items: any) => {
    if (!items) return []
    
    try {
      if (Array.isArray(items)) return items
      if (typeof items === 'string') {
        return JSON.parse(items)
      }
      return []
    } catch (err) {
      console.error('Error parsing order items:', err)
      return []
    }
  }

  const clearSearch = () => {
    setOrderNumber('')
    setFoundOrder(null)
    setError('')
    // Remove query parameters from URL
    router.replace('/track-order')
  }

  // Show loading state while auto-loading
  if (autoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alfamart-blue mx-auto mb-4" />
                <p className="text-gray-600">Loading your order...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Search Card - Show only if no order is found or user wants to search again */}
        {!foundOrder && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-alfamart-blue">
                Track Your Order
              </CardTitle>
              <p className="text-center text-gray-600">
                Enter your order number to check the status
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter order number or order ID"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="bg-alfamart-blue hover:bg-alfamart-blue/90"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Details Card */}
        {foundOrder && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl">
                      Order #{foundOrder.orderNumber || foundOrder.id?.substring(0, 4)}
                    </CardTitle>
                    <p className="text-gray-600">
                      Placed on {new Date(foundOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(foundOrder.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">
                    {foundOrder.customerName || foundOrder.customers?.name || 'N/A'}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {foundOrder.customerPhone || foundOrder.customers?.phone || 'N/A'}
                  </p>
                  {(foundOrder.customers?.email) && (
                    <p className="text-gray-600">{foundOrder.customers.email}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {formatOrderItems(foundOrder.items).length > 0 ? (
                    <ul className="space-y-1">
                      {formatOrderItems(foundOrder.items).map((item: any, index: number) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Items information not available</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₱{foundOrder.total_amount}</span>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                {foundOrder.status === 'pending' && (
                  <p className="text-blue-800">
                    🎯 Your order #{(foundOrder.orderNumber || foundOrder.id)?.substring(0, 4)} has been received and is being prepared.
                  </p>
                )}
                {foundOrder.status === 'preparing' && (
                  <p className="text-orange-800">
                    👨‍🍳 Your order #{(foundOrder.orderNumber || foundOrder.id)?.substring(0, 4)} is currently being prepared. Almost ready!
                  </p>
                )}
                {foundOrder.status === 'ready' && (
                  <p className="text-green-800">
                    ✅ Your order is ready for pickup. Please come to the store to collect it.
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Track Another Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}