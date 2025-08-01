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
}

export function StatusColumn({ 
  title, 
  orders, 
  onClickOrder, 
  onStatusChange,
  highlightReady = false 
}: StatusColumnProps) {
  
  // Map display titles to database status values
  const statusMapping = {
    "New": "pending",
    "Preparing": "preparing", 
    "Ready": "ready"
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ORDER, // Changed from ORDER_CARD to ORDER
    drop: (item: { id: string; currentStatus: string }, monitor) => {
      const newStatus = statusMapping[title] || title.toLowerCase()
      
      if (item.currentStatus !== newStatus) {
        const orderToUpdate = orders.find((o) => o.id === item.id)
        if (orderToUpdate) {
          // Call the parent component's status change handler
          onStatusChange(item.id, newStatus)

          // If the order is moved to "Ready", show notification toast
          if (newStatus === "ready") {
            toast({
              title: "Order Ready!",
              description: `Order ${orderToUpdate.orderNumber} is now ready for pickup.`,
            })
            
            // Optional: You could add actual SMS/email notification here
            // For now, just simulate it
            setTimeout(() => {
              toast({
                title: "Customer Notified",
                description: `${orderToUpdate.customerName} has been notified that order ${orderToUpdate.orderNumber} is ready.`,
              })
            }, 1000)
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={cn(
        "flex flex-col h-full bg-white border-2 border-dashed border-alfamart-blue/50 p-1 sm:p-2 md:p-4 rounded-lg shadow-inner min-w-0 transition-colors",
        isOver ? "border-alfamart-blue bg-alfamart-blue/10" : "",
        highlightReady && title === "Ready" ? "bg-green-50 border-green-300" : ""
      )}
    >
      <Card className="flex flex-col h-full bg-transparent border-none shadow-none p-0">
        <CardHeader className="pb-2 px-0">
          <CardTitle className={cn(
            "text-sm sm:text-base md:text-xl font-bold text-center py-2 rounded-lg",
            title === "New" && "text-blue-700 bg-blue-100",
            title === "Preparing" && "text-orange-700 bg-orange-100", 
            title === "Ready" && "text-green-700 bg-green-100",
          )}>
            {title} ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 md:space-y-3 px-0 pb-0 custom-scrollbar">
          {orders.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              No orders in {title.toLowerCase()}
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={onClickOrder}
                highlight={highlightReady && order.status === "ready"}
              />
            ))
          )}
        </CardContent>
      </Card>
      
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