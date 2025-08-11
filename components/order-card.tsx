"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    customerName: string
    contactNumber: string
    items: string[]
    status: string
    timestamp: string
    totalAmount?: number
  }
  onClick?: (order: any) => void
  highlight?: boolean
  isUpdating?: boolean
}

export function OrderCard({ order, onClick, highlight, isUpdating }: OrderCardProps) {
  const statusColors = {
    pending: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isUpdating) {
      e.preventDefault()
      return
    }

    // Set drag data
    e.dataTransfer.setData("text/plain", order.id)
    e.dataTransfer.effectAllowed = "move"

    // Create drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(5deg)"
    dragImage.style.opacity = "0.8"
    e.dataTransfer.setDragImage(dragImage, 50, 30)

    // Add visual feedback to original element
    const target = e.currentTarget as HTMLElement
    target.style.opacity = "0.5"
    target.style.transform = "rotate(2deg) scale(1.05)"

    console.log("Drag started for order:", order.id)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = "1"
    target.style.transform = "none"
    console.log("Drag ended for order:", order.id)
  }

  return (
    <Card
      draggable={!isUpdating}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "bg-white shadow-sm hover:shadow-md transition-all duration-200",
        "border border-gray-200 relative select-none",
        !isUpdating && "cursor-grab active:cursor-grabbing",
        highlight && "ring-2 ring-blue-400 ring-offset-1",
        isUpdating && "ring-2 ring-orange-400 cursor-wait",
        !isUpdating && "hover:border-gray-300",
      )}
      onClick={() => onClick && onClick(order)}
      style={{ touchAction: "none" }}
    >
      {/* Loading overlay when updating */}
      {isUpdating && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-2 w-2 border border-blue-600 border-t-transparent"></div>
            <span className="text-xs text-blue-600 font-medium">Updating...</span>
          </div>
        </div>
      )}

      <CardContent className="p-1.5">
        {/* Order ID and Status Badge - Smaller fonts */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] font-bold text-gray-900 min-w-0 flex-1 mr-1">{order.orderNumber}</div>
          <Badge
            className={cn(
              "text-[9px] px-1 py-0 rounded-full font-medium flex-shrink-0",
              statusColors[order.status] || "bg-gray-100 text-gray-800",
            )}
          >
            {order.status === "pending" ? "New" : order.status === "preparing" ? "Prep" : "Ready"}
          </Badge>
        </div>

        {/* Customer Name - Smaller font */}
        <div className="text-[10px] text-gray-700 truncate mb-1">{order.customerName}</div>

        {/* Time and Price - Smaller fonts */}
        <div className="flex justify-between items-center">
          <div className="text-[9px] text-gray-500">
            {new Date(order.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {order.totalAmount && (
            <div className="text-[10px] font-bold text-green-600">₱{order.totalAmount.toFixed(2)}</div>
          )}
        </div>

        {/* Small drag handle at bottom right */}
        <div className="flex justify-end mt-0.5">
          <div className="text-gray-400 opacity-50">
            <svg width="4" height="4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3H11V5H9V3ZM13 3H15V5H13V3ZM9 7H11V9H9V7ZM13 7H15V9H13V7Z" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
