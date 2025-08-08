"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderCard } from "./order-card"
import { useDrop } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface StatusColumnProps {
  title: string
  orders: any[]
  onClickOrder: (order: any) => void
  onStatusChange: (orderId: string, newStatus: string) => void
  highlightReady?: boolean
  updatingOrderId?: string | null // Add this prop to track which order is updating
}

export function StatusColumn({ 
  title, 
  orders, 
  onClickOrder, 
  onStatusChange,
  highlightReady = false,
  updatingOrderId = null
}: StatusColumnProps) {
  
  // Map display titles to database status values
  const statusMapping = {
    "New": "pending",
    "Preparing": "preparing", 
    "Ready": "ready"
  }

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.ORDER,
    drop: (item: { id: string; currentStatus: string; orderNumber: string; status: string }, monitor) => {
      // Prevent dropping if already processed by a nested target
      if (monitor.didDrop()) {
        return
      }
      
      const newStatus = statusMapping[title] || title.toLowerCase()

      console.log('Dropping order:', item.id, 'from', item.currentStatus, 'to', newStatus)
      console.log('Orders in column:', orders.length, 'Target status:', newStatus)
      
      // Only process if status is actually changing
      if (item.currentStatus !== newStatus && item.status !== newStatus) {
        const orderToUpdate = orders.find((o) => o.id === item.id) || 
                            // If not in current column, find in all available orders
                            { id: item.id, orderNumber: item.orderNumber, customerName: 'Customer' }

        console.log('Order to update:', orderToUpdate)

        if (orderToUpdate) {
          // Call the parent component's status change handler
          onStatusChange(item.id, newStatus)

          // Show immediate feedback
          toast({
            title: "Order Updated",
            description: `Order ${item.orderNumber} moved to ${title}`,
          })

          // If the order is moved to "Ready", show notification toast
          if (newStatus === "ready") {
            setTimeout(() => {
              toast({
                title: "Order Ready!",
                description: `Order ${item.orderNumber} is now ready for pickup.`,
              })
              
              // Optional: You could add actual SMS/email notification here
              setTimeout(() => {
                toast({
                  title: "Customer Notified",
                  description: `Customer has been notified that order ${item.orderNumber} is ready.`,
                })
              }, 1000)
            }, 500)
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isActive = isOver && canDrop

  return (
    <div
      ref={drop}
      className={cn(
        "flex flex-col h-full bg-white border-2 border-dashed border-alfamart-blue/50 p-1 sm:p-2 md:p-4 rounded-lg shadow-inner min-w-0 transition-all duration-200 ease-in-out",
        isActive ? "border-alfamart-blue bg-alfamart-blue/20 scale-[1.02]" : "",
        isOver && !canDrop ? "border-red-400 bg-red-50" : "",
        highlightReady && title === "Ready" ? "bg-green-50 border-green-300" : ""
      )}
    >
      <Card className="flex flex-col h-full bg-transparent border-none shadow-none p-0">
        <CardHeader className="pb-2 px-0">
          <CardTitle className={cn(
            "text-sm sm:text-base md:text-xl font-bold text-center py-2 rounded-lg transition-colors",
            title === "New" && "text-blue-700 bg-blue-100",
            title === "Preparing" && "text-orange-700 bg-orange-100", 
            title === "Ready" && "text-green-700 bg-green-100",
            isActive && "ring-2 ring-alfamart-blue ring-offset-2"
          )}>
            {title} ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 md:space-y-3 px-0 pb-0 custom-scrollbar">
          {orders.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm relative">
              <div className="mb-2">No orders in {title.toLowerCase()}</div>
              {isActive && (
                <div className="text-alfamart-blue font-medium animate-bounce">
                  Drop order here
                </div>
              )}
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={onClickOrder}
                highlight={highlightReady && order.status === "ready"}
                isUpdating={updatingOrderId === order.id} // Pass the updating state
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Drop zone overlay when actively dragging over */}
      {isActive && (
        <div className="absolute inset-2 border-2 border-dashed border-alfamart-blue rounded-lg bg-alfamart-blue/10 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-alfamart-blue font-bold">Drop order here</p>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  )
}