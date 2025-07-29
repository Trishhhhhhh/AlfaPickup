"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { StatusColumn } from "./status-column"
import { ModalOrderDetails } from "./modal-order-details"
import { toast } from "@/hooks/use-toast"
import { dataStore, type OrderStatus } from "@/lib/data-store"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"

// Custom DndProvider to support both HTML5 (desktop) and Touch (mobile)
const MultiBackendDndProvider = ({ children }: { children: React.ReactNode }) => {
  // Use a simple check for touch support, or a more robust one if needed
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)

  return <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>{children}</DndProvider>
}

export function DragAndDropBoard() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const prevReadyOrderIdsRef = useRef<Set<string>>(new Set())

  const orderStatuses: OrderStatus[] = ["New", "Preparing", "Ready"]

  // Subscribe to real-time updates from the data store
  useEffect(() => {
    const unsubscribe = dataStore.onSnapshot((updatedOrders) => {
      setOrders(updatedOrders)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const currentReadyOrders = orders.filter((order) => order.status === "Ready")
    const currentReadyOrderIds = new Set(currentReadyOrders.map((order) => order.id))

    const newReadyOrders = currentReadyOrders.filter((order) => !prevReadyOrderIdsRef.current.has(order.id))

    if (newReadyOrders.length > 0) {
      // Play sound alert for each new ready order
      newReadyOrders.forEach((order) => {
        console.log(`Order ${order.orderNumber} is now Ready! Playing sound.`)
        // Updated to use your specific MP3 file
        const audio = new Audio("/sounds/3-up-2-89189.mp3")
        audio.play().catch((e) => console.error("Error playing sound:", e))
      })
    }

    // Update the ref with the current ready order IDs for the next render
    prevReadyOrderIdsRef.current = currentReadyOrderIds
  }, [orders])

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleModalSave = (updatedOrder: any) => {
    dataStore.updateOrder(updatedOrder)
    toast({
      title: "Order Updated",
      description: `Order ${updatedOrder.orderNumber} details saved.`,
    })
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status)
  }

  return (
    <MultiBackendDndProvider>
      <div className="flex flex-col h-screen bg-gradient-to-br from-soft-purple to-lavender-100 p-2 sm:p-4 md:p-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-dark-purple mb-4 sm:mb-6 md:mb-8">
          Order Management Dashboard
        </h1>
        {/* Fixed 3-column grid for all screen sizes */}
        <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 overflow-y-auto">
          {orderStatuses.map((status) => (
            <StatusColumn
              key={status}
              title={status}
              orders={getOrdersByStatus(status)}
              onClickOrder={handleOrderClick}
              highlightReady={status === "Ready"}
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
