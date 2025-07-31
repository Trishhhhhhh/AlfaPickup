"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { getOrders, updateOrderStatus } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function ReadyForPickupList() {
  const [readyOrders, setReadyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load orders from API
  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      const ordersData = await getOrders()
      
      // Filter only ready orders and transform data
      const readyOrdersData = ordersData
        .filter(order => order.status === 'ready')
        .map(order => ({
          id: order.id,
          orderNumber: `#${order.id}`,
          customerName: order.customers?.name || 'Guest',
          customerPhone: order.customers?.phone || '',
          items: order.items.map(item => `${item.quantity}x ${item.name}`),
          timestamp: order.created_at,
          totalAmount: parseFloat(order.total_amount)
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by oldest first
      
      setReadyOrders(readyOrdersData)
    } catch (error) {
      console.error('Error loading ready orders:', error)
      toast({
        title: "Error",
        description: "Failed to load ready orders. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  // Mark order as completed (picked up)
  const markAsCompleted = async (orderId, orderNumber) => {
    try {
      await updateOrderStatus(orderId, 'completed')
      
      // Remove from local state immediately
      setReadyOrders(prev => prev.filter(order => order.id !== orderId))
      
      toast({
        title: "Order Completed",
        description: `Order ${orderNumber} marked as picked up.`,
      })
    } catch (error) {
      console.error('Error marking order as completed:', error)
      toast({
        title: "Error",
        description: "Failed to mark order as completed. Please try again.",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    loadOrders()
    
    // Set up polling for real-time updates every 15 seconds
    const interval = setInterval(() => {
      loadOrders(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alfamart-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ready orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white p-6 flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-6xl mb-8 sm:mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-alfamart-red text-center flex-1">
          Orders Ready for Pickup
        </h1>
        <div className="flex items-center space-x-4">
          {refreshing && (
            <div className="flex items-center text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </div>
          )}
          <Button
            onClick={() => loadOrders(true)}
            variant="outline"
            size="sm"
            className="border-alfamart-blue text-alfamart-blue hover:bg-alfamart-blue hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {readyOrders.length === 0 ? (
        <div className="text-center text-gray-600 text-xl mt-10">
          <CheckCircle2 className="h-16 w-16 mx-auto text-alfamart-blue mb-4" />
          No orders currently ready for pickup. Please check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
          {readyOrders.map((order) => (
            <Card
              key={order.id}
              className={cn(
                "bg-white shadow-lg border-2 border-alfamart-blue",
                "transform transition-transform duration-300 hover:scale-105",
                "animate-pulse-once", // Custom animation for initial highlight
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold text-alfamart-red">{order.orderNumber}</CardTitle>
                    <p className="text-md text-gray-700 mt-1">
                      {order.customerName !== "Guest" ? order.customerName : "Guest Order"}
                    </p>
                    {order.customerPhone && (
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    )}
                  </div>
                  <Badge className="bg-alfamart-blue text-white text-sm px-3 py-1 rounded-full">Ready!</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Items:</h4>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="truncate">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <p className="font-semibold text-alfamart-red">
                        Total: ₱{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ready: {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => markAsCompleted(order.id, order.orderNumber)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-3"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Picked Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes pulse-once {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 74, 153, 0.7); /* Alfamart Blue with opacity */
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 74, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 74, 153, 0);
          }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-out;
        }
      `}</style>
    </div>
  )
}