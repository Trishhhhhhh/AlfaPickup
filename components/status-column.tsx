"use client"

import type React from "react"
import { OrderCard } from "./order-card"
import { cn } from "@/lib/utils"

interface StatusColumnProps {
  title: string
  status: string
  orders: any[]
  onClickOrder: (order: any) => void
  onStatusChange: (orderId: string, newStatus: string) => void
  highlightReady?: boolean
  updatingOrderId?: string | null
  // New drag and drop props
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragOver?: boolean
  draggedOrder?: any
  isValidDropTarget?: boolean
}

export function StatusColumn({
  title,
  status,
  orders,
  onClickOrder,
  onStatusChange,
  highlightReady = false,
  updatingOrderId = null,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  draggedOrder,
  isValidDropTarget = true,
}: StatusColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Ensure we can accept the drop
    e.dataTransfer.dropEffect = "move"

    console.log("Drag over column:", status)

    if (onDragOver) {
      onDragOver(e)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    if (onDragLeave) {
      onDragLeave(e)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Drop event in column:", status)

    if (onDrop) {
      onDrop(e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border min-w-0 max-h-full">
      {/* Column Header - More compact with smaller fonts */}
      <div className="flex items-center gap-1 p-1.5 border-b flex-shrink-0">
        <div className="w-2 h-2">
          {title === "New Orders" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
          {title === "Preparing" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
          {title === "Ready" && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
        </div>
        <h2 className="font-semibold text-gray-800 text-[10px] truncate flex-1">
          {title === "New Orders" ? "New" : title}
        </h2>
        <div className="bg-gray-100 text-gray-600 text-[9px] px-1 py-0.5 rounded-full min-w-[16px] text-center">
          {orders.length}
        </div>
      </div>

      {/* Drop Zone Box - More compact */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "mx-1 mt-1 p-1 text-center border-2 border-dashed rounded-lg transition-all duration-200 flex-shrink-0",
          "min-h-[20px]", // Smaller minimum height
          isDragOver && isValidDropTarget
            ? "border-blue-400 bg-blue-50 scale-105 shadow-md"
            : isDragOver && !isValidDropTarget
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100",
          !isValidDropTarget && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="text-[9px] font-medium text-gray-500">
          {!isValidDropTarget ? (
            <span className="text-red-400">✗</span>
          ) : isDragOver ? (
            <span className="text-blue-600">Drop</span>
          ) : (
            <span>Drop</span>
          )}
        </div>
      </div>

      {/* Orders List - More compact spacing */}
      <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0">
        {orders.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-[9px]">No orders</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={onClickOrder}
              highlight={highlightReady && order.status === "ready"}
              isUpdating={updatingOrderId === order.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
