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
    pending: "bg-alfamart-blue text-white",
    preparing: "bg-alfamart-red text-white",
    ready: "bg-green-500 text-white",
    completed: "bg-alfamart-gray-dark text-white",
    cancelled: "bg-red-600 text-white",
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isUpdating) {
      e.preventDefault()
      return
    }

    // Set drag data
    e.dataTransfer.setData("text/plain", order.id)
    e.dataTransfer.effectAllowed = "move"

    // Create enhanced drag image
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    // Clone the element for drag image
    const dragImage = target.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(3deg) scale(1.05)"
    dragImage.style.opacity = "0.9"
    dragImage.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)"
    dragImage.style.border = "2px solid #FFD700"
    dragImage.style.borderRadius = "8px"

    // Temporarily add to DOM for drag image
    dragImage.style.position = "absolute"
    dragImage.style.top = "-1000px"
    document.body.appendChild(dragImage)

    e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2)

    // Enhanced visual feedback
    target.style.opacity = "0.3"
    target.style.transform = "rotate(2deg) scale(1.02)"
    target.style.boxShadow = "0 4px 12px rgba(238, 46, 36, 0.4)"
    target.style.border = "1px dashed #FFD700"
    target.style.zIndex = "1000"

    console.log("Drag started for order:", order.id)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = "1"
    target.style.transform = "none"
    target.style.boxShadow = ""
    target.style.border = ""
    target.style.zIndex = ""
    console.log("Drag ended for order:", order.id)
  }

  return (
    <Card
      draggable={!isUpdating}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "bg-white shadow-sm hover:shadow-md transition-all duration-200 font-sans",
        "border border-gray-200 relative select-none rounded-md",
        !isUpdating &&
          "cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lg hover:border-alfamart-yellow",
        highlight && "ring-1 ring-alfamart-yellow ring-offset-1 animate-pulse shadow-md shadow-alfamart-yellow/20",
        isUpdating && "ring-1 ring-alfamart-red cursor-wait",
        !isUpdating && "hover:bg-gradient-to-br hover:from-white hover:to-alfamart-blue-light/30",
      )}
      onClick={() => onClick && onClick(order)}
      style={{ touchAction: "none" }}
    >
      {/* Loading overlay when updating */}
      {isUpdating && (
        <div className="absolute inset-0 bg-alfamart-blue-light bg-opacity-90 rounded-md flex items-center justify-center z-10">
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-1.5 w-1.5 border border-alfamart-red border-t-transparent"></div>
            <span className="text-[7px] text-alfamart-red font-bold">Updating...</span>
          </div>
        </div>
      )}

      <CardContent className="p-1 sm:p-1.5">
        {/* Order ID and Status Badge - Mobile optimized */}
        <div className="flex justify-between items-center mb-0.5 sm:mb-1">
          <div className="text-[8px] sm:text-[10px] font-black text-alfamart-blue min-w-0 flex-1 mr-1 tracking-wide truncate">
            {order.orderNumber}
          </div>
          <Badge
            className={cn(
              "text-[6px] sm:text-[8px] px-1 py-0 sm:py-0.5 rounded-full font-black flex-shrink-0 shadow-sm",
              statusColors[order.status] || "bg-gray-500 text-white",
            )}
          >
            {order.status === "pending" ? "NEW" : order.status === "preparing" ? "PREP" : "READY"}
          </Badge>
        </div>

        {/* Customer Name - Mobile optimized */}
        <div className="text-[7px] sm:text-[9px] text-gray-700 truncate mb-0.5 sm:mb-1 font-bold">
          {order.customerName}
        </div>

        {/* Time and Price - Mobile optimized */}
        <div className="flex justify-between items-center">
          <div className="text-[6px] sm:text-[8px] text-alfamart-blue font-bold">
            {new Date(order.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {order.totalAmount && (
            <div className="text-[7px] sm:text-[9px] font-black text-alfamart-red">₱{order.totalAmount.toFixed(2)}</div>
          )}
        </div>

        {/* Minimal drag handle */}
        <div className="flex justify-end mt-0.5">
          <div className="text-alfamart-yellow opacity-50 hover:opacity-100 transition-opacity">
            <svg width="4" height="4" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[6px] sm:h-[6px]">
              <path d="M9 3H11V5H9V3ZM13 3H15V5H13V3ZM9 7H11V9H9V7ZM13 7H15V9H13V7ZM9 11H11V13H9V11ZM13 11H15V13H13V11Z" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
