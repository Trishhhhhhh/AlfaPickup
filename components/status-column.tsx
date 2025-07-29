"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderCard } from "./order-card"
import { useDrop } from "react-dnd"
import { ItemTypes } from "@/lib/item-types"
import { dataStore, type OrderStatus } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface StatusColumnProps {
  title: string
  orders: any[]
  onClickOrder: (order: any) => void
  highlightReady?: boolean
}

export function StatusColumn({ title, orders, onClickOrder, highlightReady = false }: StatusColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ORDER,
    drop: (item: { id: string; currentStatus: OrderStatus }, monitor) => {
      if (item.currentStatus !== title) {
        const orderToUpdate = dataStore.getAllOrders().find((o) => o.id === item.id)
        if (orderToUpdate) {
          dataStore.updateOrderStatus(item.id, title as OrderStatus)
          toast({
            title: "Order Status Updated",
            description: `Order ${orderToUpdate.orderNumber} moved to ${title}.`,
          })

          // If the order is moved to "Ready", simulate sending a notification
          if (title === "Ready") {
            dataStore
              .sendOrderReadyNotification(
                orderToUpdate.orderNumber,
                orderToUpdate.customerName,
                orderToUpdate.contactNumber,
              )
              .then(() => {
                toast({
                  title: "Customer Notified",
                  description: `Notification sent to ${orderToUpdate.customerName} for order ${orderToUpdate.orderNumber}. (Simulated)`,
                })
              })
              .catch((error) => {
                console.error("Simulated notification failed:", error)
                toast({
                  title: "Notification Failed",
                  description: `Failed to send notification for order ${orderToUpdate.orderNumber}. (Simulated)`,
                  variant: "destructive",
                })
              })
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
        "flex flex-col h-full bg-alfamart-gray border-2 border-dashed border-alfamart-blue/50 p-1 sm:p-2 md:p-4 rounded-lg shadow-inner min-w-0",
        isOver ? "border-alfamart-blue bg-alfamart-blue/10" : "",
      )}
    >
      <Card className="flex flex-col h-full bg-alfamart-gray border-2 border-dashed border-alfamart-blue/50 p-1 sm:p-2 md:p-4 rounded-lg shadow-inner min-w-0">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-alfamart-red text-center">
            {title} ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 md:space-y-4 pr-1 custom-scrollbar">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={onClickOrder}
              highlight={highlightReady && order.status === "Ready"}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
