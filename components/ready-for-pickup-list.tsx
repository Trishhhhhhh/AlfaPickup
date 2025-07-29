"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { dataStore } from "@/lib/data-store"

export function ReadyForPickupList() {
  const [readyOrders, setReadyOrders] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = dataStore.onSnapshot((allOrders) => {
      const filteredReadyOrders = allOrders
        .filter((order) => order.status === "Ready")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by oldest first
      setReadyOrders(filteredReadyOrders)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white p-6 flex flex-col items-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-alfamart-red mb-8 sm:mb-10 text-center">
        Orders Ready for Pickup
      </h1>

      {readyOrders.length === 0 ? (
        <div className="text-center text-gray-600 text-xl mt-10">
          <CheckCircle2 className="h-16 w-16 mx-auto text-alfamart-blue mb-4" />
          No orders currently ready for pickup. Please check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
          {readyOrders.map((order) => (
            <Card
              key={order.id}
              className={cn(
                "bg-white shadow-lg border-2 border-alfamart-blue",
                "transform transition-transform duration-300 hover:scale-105",
                "animate-pulse-once", // Custom animation for initial highlight
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-3xl font-bold text-alfamart-red">{order.orderNumber}</CardTitle>
                  <Badge className="bg-alfamart-blue text-white text-sm px-3 py-1 rounded-full">Ready!</Badge>
                </div>
                <p className="text-md text-gray-700 mt-1">
                  {order.customerName !== "Guest" ? order.customerName : "Guest Order"}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-800 space-y-1">
                  {order.items.map((item: string, index: number) => (
                    <li key={index} className="truncate">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3">Placed: {new Date(order.timestamp).toLocaleTimeString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse-once {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 74, 153, 0.7); /* Alfamart Blue with opacity */
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 74, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 74, 153, 0);
          }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>
    </div>
  )
}
