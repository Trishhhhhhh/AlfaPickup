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

  // Mobile-optimized Alfamart-themed column colors
  const getColumnTheme = () => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-gradient-to-b from-alfamart-blue-light/90 to-white",
          border: "border-alfamart-blue/50",
          icon: "bg-alfamart-blue",
          dragOverBg: "bg-alfamart-blue-light border-alfamart-blue shadow-lg",
          headerBg: "bg-alfamart-blue-light/70 border-alfamart-blue/40",
          textColor: "text-alfamart-blue",
        }
      case "preparing":
        return {
          bg: "bg-gradient-to-b from-alfamart-red-light/90 to-white",
          border: "border-alfamart-red/50",
          icon: "bg-alfamart-red",
          dragOverBg: "bg-alfamart-red-light border-alfamart-red shadow-lg",
          headerBg: "bg-alfamart-red-light/70 border-alfamart-red/40",
          textColor: "text-alfamart-red",
        }
      case "ready":
        return {
          bg: "bg-gradient-to-b from-green-100/90 to-white",
          border: "border-green-400/50",
          icon: "bg-green-500",
          dragOverBg: "bg-green-200 border-green-400 shadow-lg",
          headerBg: "bg-green-100/70 border-green-300/40",
          textColor: "text-green-700",
        }
      default:
        return {
          bg: "bg-white",
          border: "border-gray-200",
          icon: "bg-gray-500",
          dragOverBg: "bg-gray-100 border-gray-300",
          headerBg: "bg-gray-50 border-gray-200",
          textColor: "text-gray-700",
        }
    }
  }

  const theme = getColumnTheme()

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-lg sm:rounded-2xl shadow-md border-2 min-w-0 max-h-full transition-all duration-300 ease-in-out font-sans",
        theme.bg,
        theme.border,
        // Enhanced drag over effects
        isDragOver && isValidDropTarget && theme.dragOverBg,
        isDragOver && !isValidDropTarget && "bg-red-100 border-red-400 shadow-lg",
        // Pulse animation when valid drop target
        isDragOver && isValidDropTarget && "animate-pulse",
        // Disabled state for invalid drops
        !isValidDropTarget && draggedOrder && "opacity-60 cursor-not-allowed",
      )}
      // Make entire column a drop zone
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Compact Mobile Header */}
      <div
        className={cn(
          "flex items-center gap-1 p-1 sm:p-2 border-b-2 flex-shrink-0 transition-all duration-200 rounded-t-lg sm:rounded-t-2xl",
          theme.headerBg,
          theme.border,
          isDragOver && isValidDropTarget && "bg-alfamart-yellow/30",
          isDragOver && !isValidDropTarget && "bg-red-200",
        )}
      >
        <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-sm", theme.icon)}></div>
        <h2
          className={cn(
            "font-black text-[8px] sm:text-[10px] truncate flex-1 transition-colors duration-200 tracking-wide",
            theme.textColor,
            isDragOver && isValidDropTarget && "text-alfamart-blue",
            isDragOver && !isValidDropTarget && "text-red-700",
          )}
        >
          {status === "pending" ? "NEW" : status === "preparing" ? "PREP" : "READY"}
        </h2>
        <div
          className={cn(
            "text-white text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full min-w-[14px] sm:min-w-[18px] text-center font-bold shadow-sm transition-all duration-200",
            theme.icon,
            isDragOver && isValidDropTarget && "bg-alfamart-yellow text-alfamart-red",
            isDragOver && !isValidDropTarget && "bg-red-500",
          )}
        >
          {orders.length}
        </div>
      </div>

      {/* Drop indicator overlay - Mobile optimized */}
      {isDragOver && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center z-10 rounded-lg sm:rounded-2xl transition-all duration-200",
            isValidDropTarget
              ? "bg-alfamart-blue-light/90 border-2 border-dashed border-alfamart-blue"
              : "bg-red-100/90 border-2 border-dashed border-red-400",
          )}
        >
          <div
            className={cn(
              "text-center p-1 sm:p-2 rounded-lg font-black text-[8px] sm:text-sm shadow-lg",
              isValidDropTarget
                ? "text-alfamart-blue bg-white/95 border-2 border-alfamart-yellow"
                : "text-red-700 bg-white/95 border-2 border-red-300",
            )}
          >
            {isValidDropTarget ? (
              <>
                <div className="text-sm sm:text-lg mb-0.5 sm:mb-1">📦</div>
                <div className="font-black">DROP</div>
              </>
            ) : (
              <>
                <div className="text-sm sm:text-lg mb-0.5 sm:mb-1">🚫</div>
                <div className="font-black">NO</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders List - Mobile optimized */}
      <div className="flex-1 overflow-y-auto p-0.5 sm:p-1 space-y-0.5 sm:space-y-1 min-h-0 relative">
        {orders.length === 0 ? (
          <div className={cn("text-center py-2 sm:py-4 text-[8px] sm:text-[9px] font-bold", theme.textColor)}>
            No orders
          </div>
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
