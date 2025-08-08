"use client"

import React, { useState, useEffect, useRef } from "react"
import { StatusColumn } from "./status-column"
import { ModalOrderDetails } from "./modal-order-details"
import { toast } from "@/hooks/use-toast"
import { getOrders, updateOrderStatus } from "@/lib/api"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"

const MultiBackendDndProvider = ({ children }) => {
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  return <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>{children}</DndProvider>
}

export function DragAndDropBoard() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null) // Track which order is being updated
  const prevReadyOrderIdsRef = useRef(new Set())

  const orderStatuses = ["pending", "preparing", "ready"]
  const statusDisplayNames = {
    pending: "New",
    preparing: "Preparing",
    ready: "Ready"
  }

  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      console.log('Loading orders...')
      
      const apiResponse = await getOrders()
      console.log('API Response:', apiResponse)
      
      // Handle the API response format { success: true, data: [...] }
      let ordersData = []
      if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
        ordersData = apiResponse.data
      } else if (Array.isArray(apiResponse)) {
        ordersData = apiResponse
      } else {
        console.error('Unexpected API response format:', apiResponse)
        throw new Error('Invalid response format from orders API')
      }

      console.log('Processing orders data:', ordersData)

      const transformedOrders = ordersData.map(order => {
        // Parse items if they're stored as JSON string
        let parsedItems = []
        try {
          if (typeof order.items === 'string') {
            parsedItems = JSON.parse(order.items)
          } else if (Array.isArray(order.items)) {
            parsedItems = order.items
          }
        } catch (e) {
          console.error('Error parsing items for order:', order.id, e)
          parsedItems = []
        }

        return {
          id: order.id,
          orderNumber: `#${order.id.slice(0, 8)}`,
          customerName: order.customers?.name || 'Guest',
          customerPhone: order.customers?.phone || '',
          customerEmail: order.customers?.email || '',
          contactNumber: order.customers?.phone || 'N/A', // Add this for OrderCard compatibility
          items: parsedItems.map(item => `${item.quantity || 1}x ${item.name || 'Unknown Item'}`),
          rawItems: parsedItems,
          status: order.status || 'pending',
          timestamp: order.created_at,
          totalAmount: parseFloat(order.total_amount || 0),
          pickupTime: order.pickup_time
        }
      })

      console.log('Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      })
      // Set empty array to prevent further errors
      setOrders([])
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(() => {
      loadOrders(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentReadyOrders = orders.filter(order => order.status === "ready")
    const currentReadyOrderIds = new Set(currentReadyOrders.map(order => order.id))
    const newReadyOrders = currentReadyOrders.filter(order => !prevReadyOrderIdsRef.current.has(order.id))

    if (newReadyOrders.length > 0) {
      newReadyOrders.forEach(order => {
        console.log(`Order ${order.orderNumber} is now Ready! Playing sound.`)
        const audio = new Audio("/sounds/3-up-2-89189.mp3")
        audio.play().catch(e => console.error("Error playing sound:", e))
      })
    }

    prevReadyOrderIdsRef.current = currentReadyOrderIds
  }, [orders])

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId) // Set loading state for this specific order
      
      console.log(`Updating order ${orderId} status to ${newStatus}`)
      
      // Optimistically update the UI first for immediate feedback
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      // Update the database
      const result = await updateOrderStatus(orderId, newStatus)
      console.log('Database update result:', result)

      // Show success message
      toast({
        title: "Success",
        description: `Order moved to ${statusDisplayNames[newStatus]}`,
      })

      // Refresh orders after a short delay to ensure consistency with database
      setTimeout(() => {
        loadOrders(true)
      }, 1000)

    } catch (error) {
      console.error('Error updating order status:', error)
      
      // Revert optimistic update on error by reloading data
      loadOrders(true)
      
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      })
    } finally {
      // Clear updating state after a delay to show success feedback
      setTimeout(() => {
        setUpdatingOrderId(null)
      }, 1500)
    }
  }

  const handleModalSave = async (updatedOrder) => {
    try {
      if (updatedOrder.status !== selectedOrder.status) {
        await updateOrderStatus(updatedOrder.id, updatedOrder.status)
      }

      toast({
        title: "Order Updated",
        description: `Order ${updatedOrder.orderNumber} details saved.`,
      })

      setIsModalOpen(false)
      setSelectedOrder(null)
      loadOrders(true)
    } catch (error) {
      console.error('Error saving order:', error)
      toast({
        title: "Error",
        description: "Failed to save order changes. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-soft-purple to-lavender-100 p-6 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-purple mb-4"></div>
        <p className="text-dark-purple">Loading orders...</p>
      </div>
    )
  }

  return (
    <MultiBackendDndProvider>
      <div className="flex flex-col h-screen bg-gradient-to-br from-soft-purple to-lavender-100 p-2 sm:p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-purple">
            Order Management Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            {refreshing && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-purple mr-2"></div>
                Refreshing...
              </div>
            )}
            {updatingOrderId && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Updating order...
              </div>
            )}
            <button
              onClick={() => loadOrders(true)}
              className="px-3 py-1 bg-dark-purple text-white rounded-md text-sm hover:bg-opacity-80 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 overflow-y-auto">
          {orderStatuses.map((status) => (
            <StatusColumn
              key={status}
              title={statusDisplayNames[status]}
              orders={getOrdersByStatus(status)}
              onClickOrder={handleOrderClick}
              onStatusChange={handleStatusChange}
              highlightReady={status === "ready"}
              updatingOrderId={updatingOrderId} // Pass the updating order ID
            />
          ))}
        </div>

        <ModalOrderDetails
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onSave={handleModalSave}
        />
      </div>
    </MultiBackendDndProvider>
  )
}