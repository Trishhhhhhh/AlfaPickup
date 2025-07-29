"use client"

import type React from "react"
import { setSelectedOrder } from "@/hooks/useSelectedOrder" // Import setSelectedOrder

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { dataStore, type OrderStatus } from "@/lib/data-store" // Import OrderStatus and dataStore

interface ModalOrderDetailsProps {
  isOpen: boolean
  onClose: () => void
  order: any | null
  onSave: (updatedOrder: any) => void // This will now use dataStore.updateOrder
}

export function ModalOrderDetails({ isOpen, onClose, order, onSave }: ModalOrderDetailsProps) {
  const [editedOrder, setEditedOrder] = useState<any>(null)

  useEffect(() => {
    if (order) {
      setEditedOrder({ ...order, items: order.items.join("\n") }) // Convert array to string for textarea
    }
  }, [order])

  if (!order) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEditedOrder((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleStatusChange = (value: string) => {
    setEditedOrder((prev: any) => ({ ...prev, status: value as OrderStatus })) // Cast to OrderStatus
  }

  const handleSave = () => {
    if (!editedOrder.items.trim()) {
      toast({
        title: "Update Failed",
        description: "Order items cannot be empty.",
        variant: "destructive",
      })
      return
    }
    const updatedOrder = {
      ...editedOrder,
      items: editedOrder.items.split("\n").filter((item: string) => item.trim() !== ""), // Convert back to array
    }
    dataStore.updateOrder(updatedOrder) // Use the centralized update function
    toast({
      title: "Order Updated",
      description: `Order ${updatedOrder.orderNumber} details saved.`,
    })
    onClose()
    setSelectedOrder(null) // Clear selected order after saving
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-alfamart-red">Order Details: {order.orderNumber}</DialogTitle>
          <DialogDescription className="text-gray-600">View and update the details of this order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right text-gray-700">
              Customer Name
            </Label>
            <Input
              id="customerName"
              value={editedOrder?.customerName || ""}
              onChange={handleChange}
              className="col-span-3 focus:border-alfamart-blue focus:ring-alfamart-blue"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right text-gray-700">
              Contact Number
            </Label>
            <Input
              id="contactNumber"
              value={editedOrder?.contactNumber || ""}
              onChange={handleChange}
              className="col-span-3 focus:border-alfamart-blue focus:ring-alfamart-blue"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="items" className="text-right text-gray-700">
              Items
            </Label>
            <Textarea
              id="items"
              value={editedOrder?.items || ""}
              onChange={handleChange}
              rows={5}
              className="col-span-3 focus:border-alfamart-blue focus:ring-alfamart-blue"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right text-gray-700">
              Status
            </Label>
            <Select value={editedOrder?.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="col-span-3 focus:ring-alfamart-blue">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Preparing">Preparing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Picked Up">Picked Up</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem> {/* Add Cancelled status */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-alfamart-red hover:bg-alfamart-red-dark text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
