"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/data-store"
import { useDrag } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    customerName: string
    contactNumber: string
    items: string[]
    status: OrderStatus
    timestamp: string
  }
  onClick?: (order: any) => void
  highlight?: boolean
  isUpdating?: boolean // Add this prop to show loading state
}

export function OrderCard({ order, onClick, highlight, isUpdating }: OrderCardProps) {
  const statusColors = {
    New: "bg-blue-100 text-blue-800",
    Preparing: "bg-yellow-100 text-yellow-800",
    Ready: "bg-green-100 text-green-800",
    "Picked Up": "bg-gray-100 text-gray-800",
    Cancelled: "bg-red-100 text-red-800",
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ORDER,
    item: { 
      id: order.id, 
      currentStatus: order.status,
      orderNumber: order.orderNumber,
      status: order.status // Add status to the drag item for database updates
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Prevent dragging if the order is currently being updated
    canDrag: !isUpdating,
  }))

  return (
    <div
      ref={drag}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out",
        "min-w-0", // Ensure the wrapper can shrink
        isDragging ? "opacity-50 transform rotate-2 scale-105" : "", // Enhanced drag feedback
        isUpdating ? "cursor-wait" : "", // Show wait cursor when updating
      )}
      style={{ opacity: isDragging ? 0.5 : 1 }} // Explicit style for opacity
    >
      <Card
        className={cn(
          "bg-white shadow-md hover:shadow-lg relative",
          highlight && "animate-pulse ring-4 ring-alfamart-blue ring-offset-2", // Changed highlight color
          isUpdating && "ring-2 ring-blue-400", // Show updating state
        )}
        onClick={() => onClick && onClick(order)}
      >
        {/* Loading overlay when updating */}
        {isUpdating && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-blue-600 font-medium">Updating...</span>
            </div>
          </div>
        )}

        <CardHeader className="pb-1 sm:pb-2 md:pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-alfamart-red">
              {order.orderNumber}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                className={cn("px-1 py-0.5 rounded-full text-xs sm:text-sm font-medium", statusColors[order.status])}
              >
                {order.status}
              </Badge>
              {/* Drag handle indicator */}
              <div className="text-gray-400 opacity-60">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 3H11V5H9V3ZM13 3H15V5H13V3ZM9 7H11V9H9V7ZM13 7H15V9H13V7ZM9 11H11V13H9V11ZM13 11H15V13H13V11ZM9 15H11V17H9V15ZM13 15H15V17H13V15ZM9 19H11V21H9V19ZM13 19H15V21H13V19Z"/>
                </svg>
              </div>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600">
            {order.customerName} {order.contactNumber !== "N/A" && `(${order.contactNumber})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-3">
          <ul className="text-xs sm:text-sm md:text-base text-gray-800 space-y-0.5">
            {order.items.map((item, index) => (
              <li key={index} className="truncate">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Placed: {new Date(order.timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}