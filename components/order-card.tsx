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
}

export function OrderCard({ order, onClick, highlight }: OrderCardProps) {
  const statusColors = {
    New: "bg-blue-100 text-blue-800",
    Preparing: "bg-yellow-100 text-yellow-800",
    Ready: "bg-green-100 text-green-800",
    "Picked Up": "bg-gray-100 text-gray-800",
    Cancelled: "bg-red-100 text-red-800",
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ORDER,
    item: { id: order.id, currentStatus: order.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out",
        "min-w-0", // Ensure the wrapper can shrink
        isDragging ? "opacity-50" : "", // Apply opacity to the wrapper
      )}
      style={{ opacity: isDragging ? 0.5 : 1 }} // Explicit style for opacity
    >
      <Card
        className={cn(
          "bg-white shadow-md hover:shadow-lg",
          highlight && "animate-pulse ring-4 ring-alfamart-blue ring-offset-2", // Changed highlight color
        )}
        onClick={() => onClick && onClick(order)}
      >
        <CardHeader className="pb-1 sm:pb-2 md:pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-alfamart-red">
              {order.orderNumber}
            </CardTitle>
            <Badge
              className={cn("px-1 py-0.5 rounded-full text-xs sm:text-sm font-medium", statusColors[order.status])}
            >
              {order.status}
            </Badge>
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
