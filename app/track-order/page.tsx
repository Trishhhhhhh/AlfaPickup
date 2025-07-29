"use client"
import { useState, useEffect, useCallback, useRef } from "react" // Import useRef
import Link from "next/link"
import { ArrowLeft, Search, Utensils, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dataStore, type Order, type OrderStatus } from "@/lib/data-store"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast" // Import toast

export default function TrackOrderPage() {
  const [orderNumberInput, setOrderNumberInput] = useState("")
  const [foundOrder, setFoundOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const prevOrderStatusRef = useRef<OrderStatus | null>(null) // Ref to store previous order status

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case "New":
        return "bg-alfamart-blue text-white"
      case "Preparing":
        return "bg-alfamart-yellow text-alfamart-gray-dark"
      case "Ready":
        return "bg-alfamart-red text-white"
      case "Picked Up":
        return "bg-alfamart-gray text-alfamart-gray-dark"
      case "Cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const performSearch = useCallback((orderNum: string) => {
    if (!orderNum.trim()) {
      setFoundOrder(null)
      return
    }

    setIsLoading(true)
    // Simulate a slight delay for search
    setTimeout(() => {
      const allOrders = dataStore.getAllOrders()
      const order = allOrders.find((o) => o.orderNumber.toLowerCase() === orderNum.trim().toLowerCase())
      setFoundOrder(order || null)
      setIsLoading(false)
    }, 300)
  }, [])

  const handleSearchButtonClick = () => {
    setSearchAttempted(true) // Mark that a manual search was attempted
    performSearch(orderNumberInput)
  }

  // Effect to load from localStorage on initial mount
  useEffect(() => {
    const lastOrder = localStorage.getItem("lastPlacedOrderNumber")
    if (lastOrder) {
      setOrderNumberInput(lastOrder)
      performSearch(lastOrder)
    }
  }, [performSearch])

  // Subscribe to real-time updates for the found order and trigger notification
  useEffect(() => {
    if (!foundOrder) {
      prevOrderStatusRef.current = null // Reset ref if no order is found
      return
    }

    const unsubscribe = dataStore.onSnapshot((updatedOrders) => {
      const updatedFoundOrder = updatedOrders.find((o) => o.id === foundOrder.id)

      if (updatedFoundOrder) {
        // Check if status changed to "Ready"
        if (
          updatedFoundOrder.status === "Ready" &&
          prevOrderStatusRef.current !== "Ready" &&
          prevOrderStatusRef.current !== null // Ensure it's a change, not initial load
        ) {
          toast({
            title: `Order ${updatedFoundOrder.orderNumber} is Ready!`,
            description: "Your order is now ready for pickup!",
            variant: "default", // Use default or a custom success variant
            duration: 5000, // Display for 5 seconds
          })
        }
        setFoundOrder(updatedFoundOrder)
        prevOrderStatusRef.current = updatedFoundOrder.status // Update ref with current status
      } else {
        // If the order was removed or no longer exists
        setFoundOrder(null)
        localStorage.removeItem("lastPlacedOrderNumber")
        prevOrderStatusRef.current = null // Reset ref
      }
    })

    return () => unsubscribe()
  }, [foundOrder]) // Re-run effect if foundOrder changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-alfamart-blue">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Home</span>
        </Button>
      </Link>

      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-alfamart-red">Track Your Order</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your order number or see your last order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Label htmlFor="orderNumber" className="sr-only">
              Order Number
            </Label>
            <Input
              id="orderNumber"
              type="text"
              placeholder="e.g., #1234"
              value={orderNumberInput}
              onChange={(e) => {
                setOrderNumberInput(e.target.value)
                setSearchAttempted(false) // Reset search attempted state on input change
                setFoundOrder(null) // Clear previous search result
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchButtonClick()
                }
              }}
              className="flex-1 focus:border-alfamart-blue focus:ring-alfamart-blue"
            />
            <Button
              onClick={handleSearchButtonClick}
              disabled={isLoading}
              className="bg-alfamart-blue hover:bg-alfamart-blue-dark text-white"
            >
              {isLoading ? "Searching..." : <Search className="h-5 w-5" />}
              <span className="sr-only">Search</span>
            </Button>
          </div>

          {searchAttempted && !isLoading && !foundOrder && (
            <div className="text-center text-red-500 font-medium">
              Order "{orderNumberInput}" not found. Please check the number and try again.
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-600">
              <p>Loading order details...</p>
            </div>
          )}

          {foundOrder && (
            <Card className="border-2 border-alfamart-blue shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-alfamart-red">{foundOrder.orderNumber}</CardTitle>
                  <Badge
                    className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusBadgeColor(foundOrder.status))}
                  >
                    {foundOrder.status}
                  </Badge>
                </div>
                <CardDescription className="text-gray-700 flex items-center gap-1 mt-2">
                  <User className="h-4 w-4 text-alfamart-blue" />
                  {foundOrder.customerName !== "Guest" ? foundOrder.customerName : "Guest Order"}
                </CardDescription>
                {foundOrder.contactNumber !== "N/A" && (
                  <CardDescription className="text-gray-700 flex items-center gap-1">
                    <Phone className="h-4 w-4 text-alfamart-blue" />
                    {foundOrder.contactNumber}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <h3 className="text-lg font-semibold text-alfamart-blue mb-2 flex items-center gap-1">
                  <Utensils className="h-5 w-5" /> Order Items:
                </h3>
                <ul className="list-disc list-inside text-gray-800 space-y-1">
                  {foundOrder.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 mt-4">Placed: {new Date(foundOrder.timestamp).toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
