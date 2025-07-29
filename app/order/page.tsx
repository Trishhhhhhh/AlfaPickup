"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Use the in-memory data store
import { dataStore } from "@/lib/data-store"

export default function OrderFormPage() {
  const [customerName, setCustomerName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [orderItems, setOrderItems] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastPlacedOrderNumber, setLastPlacedOrderNumber] = useState<string | null>(null)

  // DEBUGGING: Log the state of lastPlacedOrderNumber
  useEffect(() => {
    console.log("lastPlacedOrderNumber state:", lastPlacedOrderNumber)
  }, [lastPlacedOrderNumber])

  const generateOrderNumber = (): string => {
    const min = 1000
    const max = 9999
    return `#${Math.floor(Math.random() * (max - min + 1)) + min}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderItems.trim()) {
      toast({
        title: "Order Failed",
        description: "Please enter order items.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const orderNumber = generateOrderNumber()
    const newOrder = {
      orderNumber,
      customerName: customerName.trim() || "Guest",
      contactNumber: contactNumber.trim() || "N/A",
      items: orderItems
        .trim()
        .split("\n")
        .filter((item) => item.trim() !== ""),
    }

    try {
      dataStore.addOrder(newOrder)
      toast({
        title: "Order Placed!",
        description: `Your order ${orderNumber} has been placed.`,
      })
      setCustomerName("")
      setContactNumber("")
      setOrderItems("")
      setLastPlacedOrderNumber(orderNumber) // Save the order number
      localStorage.setItem("lastPlacedOrderNumber", orderNumber) // Persist in local storage
      console.log("Order placed and localStorage set:", orderNumber) // DEBUGGING
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="relative">
          <Link href="/" className="absolute top-4 left-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-alfamart-blue">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          <CardTitle className="text-3xl font-bold text-center text-alfamart-red pt-4">Place Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          {lastPlacedOrderNumber ? (
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Your order <span className="font-bold text-alfamart-red">{lastPlacedOrderNumber}</span> has been placed
                successfully!
              </p>
              <Link href="/track-order">
                <Button className="w-full bg-alfamart-blue hover:bg-alfamart-blue-dark text-white text-lg py-3 rounded-full shadow-md">
                  Track My Order
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setLastPlacedOrderNumber(null)}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
              >
                Place Another Order
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="customerName" className="text-gray-700">
                  Your Name (Optional)
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 focus:border-alfamart-blue focus:ring-alfamart-blue"
                />
              </div>
              <div>
                <Label htmlFor="contactNumber" className="text-gray-700">
                  Contact Number (Optional)
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="123-456-7890"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="mt-1 focus:border-alfamart-blue focus:ring-alfamart-blue"
                />
              </div>
              <div>
                <Label htmlFor="orderItems" className="text-gray-700">
                  Order Items (Required)
                </Label>
                <Textarea
                  id="orderItems"
                  placeholder="e.g.,&#10;1x Spaghetti Carbonara&#10;2x Caesar Salad&#10;1x Soda"
                  value={orderItems}
                  onChange={(e) => setOrderItems(e.target.value)}
                  rows={6}
                  required
                  className="mt-1 focus:border-alfamart-blue focus:ring-alfamart-blue"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-alfamart-red hover:bg-alfamart-red-dark text-white text-lg py-3 rounded-full shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Submit Order"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
