"use client"

import { useState, useEffect, useRef } from "react"
import { StatusColumn } from "./status-column"
import { ModalOrderDetails } from "./modal-order-details"
import { toast } from "@/hooks/use-toast"
import { getOrders, updateOrderStatus } from "@/lib/api"

export function DragAndDropBoard() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [draggedOrder, setDraggedOrder] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const prevReadyOrderIdsRef = useRef(new Set())

  const orderStatuses = ["pending", "preparing", "ready"]
  const statusDisplayNames = {
    pending: "New Orders",
    preparing: "Preparing",
    ready: "Ready",
  }

  // Helper function to determine valid drop targets based on order status
  const getValidDropTargets = (orderStatus) => {
    switch (orderStatus) {
      case "pending":
        return ["preparing"]
      case "preparing":
        return ["ready"]
      case "ready":
        return [] // Ready orders cannot be moved
      default:
        return []
    }
  }

  // Helper function to check if a drop is valid
  const isValidDrop = (orderStatus, targetColumnId) => {
    const validTargets = getValidDropTargets(orderStatus)
    return validTargets.includes(targetColumnId)
  }

  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      console.log("Loading orders...")

      const apiResponse = await getOrders()
      console.log("API Response:", apiResponse)

      // Handle the API response format { success: true, data: [...] }
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
      const transformedOrders = ordersData.map((order) => {
        // Parse items if they're stored as JSON string
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
          orderNumber: `#${order.id.slice(0, 8)}`,
          customerName: order.customers?.name || "Guest",
          customerPhone: order.customers?.phone || "",
          customerEmail: order.customers?.email || "",
          contactNumber: order.customers?.phone || "N/A",
          items: parsedItems.map((item) => `${item.quantity || 1}x ${item.name || "Unknown Item"}`),
          rawItems: parsedItems,
          status: order.status || "pending",
          timestamp: order.created_at,
          totalAmount: Number.parseFloat(order.total_amount || 0),
          pickupTime: order.pickup_time,
        }
      })

      console.log("Transformed orders:", transformedOrders)
      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
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
    const currentReadyOrders = orders.filter((order) => order.status === "ready")
    const currentReadyOrderIds = new Set(currentReadyOrders.map((order) => order.id))
    const newReadyOrders = currentReadyOrders.filter((order) => !prevReadyOrderIdsRef.current.has(order.id))

    if (newReadyOrders.length > 0) {
      newReadyOrders.forEach((order) => {
        console.log(`Order ${order.orderNumber} is now Ready! Playing sound.`)
        const audio = new Audio("/sounds/3-up-2-89189.mp3")
        audio.play().catch((e) => console.error("Error playing sound:", e))
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
      setUpdatingOrderId(orderId)

      console.log(`Updating order ${orderId} status to ${newStatus}`)

      // Show success animation
      const successToast = toast({
        title: "✅ Success!",
        description: `Order moved to ${statusDisplayNames[newStatus]}`,
        duration: 2000,
      })

      // Optimistically update the UI first for immediate feedback
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      )

      // Update the database
      const result = await updateOrderStatus(orderId, newStatus)
      console.log("Database update result:", result)

      // Refresh orders after a short delay to ensure consistency with database
      setTimeout(() => {
        loadOrders(true)
      }, 1000)
    } catch (error) {
      console.error("Error updating order status:", error)

      // Revert optimistic update on error by reloading data
      loadOrders(true)

      toast({
        title: "❌ Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Clear updating state after a delay to show success feedback
      setTimeout(() => {
        setUpdatingOrderId(null)
      }, 1500)
    }
  }

  // Enhanced Drag and Drop handlers
  const handleDragOver = (e, columnStatus) => {
    e.preventDefault()
    e.stopPropagation()

    // Find the dragged order
    const draggedOrderId = e.dataTransfer.getData("text/plain")
    const draggedOrderData = orders.find((order) => order.id === draggedOrderId)

    console.log("Dragging order:", draggedOrderId, "over column:", columnStatus)

    if (draggedOrderData) {
      setDraggedOrder(draggedOrderData)

      if (isValidDrop(draggedOrderData.status, columnStatus)) {
        e.dataTransfer.dropEffect = "move"
        setDragOverColumn(columnStatus)
      } else {
        e.dataTransfer.dropEffect = "none"
        setDragOverColumn(columnStatus) // Still set for visual feedback
      }
    }
  }

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    e.stopPropagation()

    const draggedOrderId = e.dataTransfer.getData("text/plain")
    const draggedOrderData = orders.find((order) => order.id === draggedOrderId)

    console.log("Dropping order:", draggedOrderId, "in column:", targetStatus)

    if (draggedOrderData && isValidDrop(draggedOrderData.status, targetStatus)) {
      console.log("Valid drop - updating status")

      // Play success sound
      const audio = new Audio("/sounds/success-drop.mp3")
      audio.play().catch(() => {
        // Fallback: create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      })

      handleStatusChange(draggedOrderId, targetStatus)
    } else {
      console.log("Invalid drop")

      // Play error sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 300
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }

    setDragOverColumn(null)
    setDraggedOrder(null)
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
      console.error("Error saving order:", error)
      toast({
        title: "Error",
        description: "Failed to save order changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-alfamart-blue-light to-alfamart-red-light p-6 items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-alfamart-blue border-t-transparent mb-4"></div>
        <p className="text-alfamart-blue font-bold text-lg">Loading Alfamart Orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-alfamart-blue/5 font-sans">
      {/* Compact Mobile Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-alfamart-blue to-alfamart-red border-b-2 border-alfamart-yellow shadow-lg">
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm sm:text-lg font-black text-white tracking-wide drop-shadow-sm">Alfamart Orders</h1>
            <div className="flex items-center space-x-2">
              {refreshing && (
                <div className="flex items-center text-xs text-white/90">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                </div>
              )}
              {updatingOrderId && (
                <div className="flex items-center text-xs text-alfamart-yellow">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-alfamart-yellow border-t-transparent mr-1"></div>
                </div>
              )}
              <button
                onClick={() => loadOrders(true)}
                className="px-2 py-1 sm:px-4 sm:py-2 bg-white text-alfamart-blue rounded-md text-xs sm:text-sm font-bold hover:bg-alfamart-yellow hover:text-alfamart-red transition-all duration-200 shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized for Mobile */}
      <div className="p-1 sm:p-3">
        {/* Mobile: Three equal columns that fit on screen */}
        <div className="grid grid-cols-3 gap-1 sm:gap-3 h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]">
          {orderStatuses.map((status) => (
            <div key={status} className="min-w-0 h-full">
              <StatusColumn
                title={statusDisplayNames[status]}
                status={status}
                orders={getOrdersByStatus(status)}
                onClickOrder={handleOrderClick}
                onStatusChange={handleStatusChange}
                highlightReady={status === "ready"}
                updatingOrderId={updatingOrderId}
                // Drag and drop props
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                isDragOver={dragOverColumn === status}
                draggedOrder={draggedOrder}
                isValidDropTarget={draggedOrder ? isValidDrop(draggedOrder.status, status) : false}
              />
            </div>
          ))}
        </div>
      </div>

      <ModalOrderDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSave={handleModalSave}
      />
    </div>
  )
}
