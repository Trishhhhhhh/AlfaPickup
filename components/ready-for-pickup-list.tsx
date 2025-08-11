"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { getOrders, updateOrderStatus } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function ReadyForPickupList() {
  const [readyOrders, setReadyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load orders from API - matching the format used in drag-and-drop-board
  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      console.log("Loading ready orders...")

      const apiResponse = await getOrders()
      console.log("API Response:", apiResponse)

      // Handle the API response format { success: true, data: [...] } - same as main dashboard
      let ordersData = []
      if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
        ordersData = apiResponse.data
      } else if (Array.isArray(apiResponse)) {
        ordersData = apiResponse
      } else {
        console.error("Unexpected API response format:", apiResponse)
        throw new Error("Invalid response format from orders API")
      }

      console.log("Processing orders data:", ordersData)

      // Filter only ready orders and transform data - matching main dashboard logic
      const readyOrdersData = ordersData
        .filter((order) => order.status === "ready")
        .map((order) => {
          // Parse items if they're stored as JSON string - same logic as main dashboard
          let parsedItems = []
          try {
            if (typeof order.items === "string") {
              parsedItems = JSON.parse(order.items)
            } else if (Array.isArray(order.items)) {
              parsedItems = order.items
            }
          } catch (e) {
            console.error("Error parsing items for order:", order.id, e)
            parsedItems = []
          }

          return {
            id: order.id,
            orderNumber: `#${order.id.slice(0, 8)}`, // Match the format from main dashboard
            customerName: order.customers?.name || "Guest",
            customerPhone: order.customers?.phone || "",
            customerEmail: order.customers?.email || "",
            items: parsedItems.map((item) => `${item.quantity || 1}x ${item.name || "Unknown Item"}`),
            rawItems: parsedItems,
            timestamp: order.created_at,
            totalAmount: Number.parseFloat(order.total_amount || 0),
            pickupTime: order.pickup_time,
            status: order.status,
          }
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by oldest first

      console.log("Ready orders found:", readyOrdersData)
      setReadyOrders(readyOrdersData)
    } catch (error) {
      console.error("Error loading ready orders:", error)
      toast({
        title: "Error",
        description: "Failed to load ready orders. Please try again.",
        variant: "destructive",
      })
      setReadyOrders([])
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  // Mark order as completed (picked up)
  const markAsCompleted = async (orderId, orderNumber) => {
    try {
      console.log(`Marking order ${orderId} as completed`)
      await updateOrderStatus(orderId, "completed")

      // Remove from local state immediately
      setReadyOrders((prev) => prev.filter((order) => order.id !== orderId))

      toast({
        title: "✅ Order Completed",
        description: `Order ${orderNumber} marked as picked up.`,
      })

      // Play success sound
      try {
        const audio = new Audio("/sounds/success-drop.mp3")
        audio.play().catch(() => {
          // Fallback: create a simple success beep
          const audioContext = new (window.AudioContext || window.webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
        })
      } catch (e) {
        console.log("Could not play sound:", e)
      }
    } catch (error) {
      console.error("Error marking order as completed:", error)
      toast({
        title: "❌ Error",
        description: "Failed to mark order as completed. Please try again.",
        variant: "destructive",
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
      <div className="min-h-screen bg-gradient-to-br from-alfamart-blue-light to-alfamart-red-light flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-alfamart-blue border-t-transparent mb-4"></div>
          <p className="text-alfamart-blue font-bold text-lg">Loading Ready Orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-alfamart-blue/5 font-sans">
      {/* Header matching the image design */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-alfamart-blue to-alfamart-red border-b-4 border-alfamart-yellow shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white tracking-wide drop-shadow-sm leading-tight">
                Ready
                <br />
                for
                <br />
                Pickup
                <br />
                <span className="text-lg">({readyOrders.length})</span>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {refreshing && (
                <div className="flex items-center text-sm text-white/90">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span className="font-medium">Refreshing...</span>
                </div>
              )}
              <button
                onClick={() => loadOrders(true)}
                className="px-4 py-2 bg-alfamart-yellow text-alfamart-red rounded-lg text-sm font-black hover:bg-yellow-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {readyOrders.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-20">
            <CheckCircle2 className="h-16 w-16 mx-auto text-alfamart-blue mb-4" />
            <p className="font-bold text-alfamart-blue">No orders currently ready for pickup</p>
            <p className="text-sm text-gray-500 mt-2">Orders will appear here when they're ready!</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            {readyOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-white shadow-lg border-4 border-green-400 relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardContent className="p-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-alfamart-blue mb-1">{order.orderNumber}</h2>
                      <p className="text-base font-bold text-gray-700">
                        {order.customerName !== "Guest" ? order.customerName : "Guest Order"}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-black shadow-sm">
                      READY!
                    </Badge>
                  </div>

                  {/* Items Section */}
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-alfamart-blue mb-2 uppercase tracking-wide">ITEMS:</h3>
                    <div className="space-y-1">
                      {order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index} className="text-base text-gray-800 font-medium">
                            • {item}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic text-base">No items listed</div>
                      )}
                    </div>
                  </div>

                  {/* Price and Time */}
                  <div className="mb-4">
                    <div className="text-2xl font-black text-alfamart-red mb-1">₱{order.totalAmount.toFixed(2)}</div>
                    <div className="text-sm text-alfamart-blue font-bold">
                      Ready:{" "}
                      {new Date(order.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => markAsCompleted(order.id, order.orderNumber)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Mark as Picked Up
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
