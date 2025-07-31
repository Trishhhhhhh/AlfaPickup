"use client"

import React from "react"
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

interface ModalOrderDetailsProps {
  isOpen: boolean
  onClose: () => void
  order: any | null
  onSave: (updatedOrder: any) => void
}

export function ModalOrderDetails({ isOpen, onClose, order, onSave }: ModalOrderDetailsProps) {
  const [editedOrder, setEditedOrder] = useState<any>(null)

  useEffect(() => {
    if (order) {
      setEditedOrder({ 
        ...order, 
        items: order.items.join("\n"), // Convert array to string for textarea
        contactNumber: order.customerPhone || ""
      })
    }
  }, [order])

  if (!order) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEditedOrder((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleStatusChange = (value: string) => {
    setEditedOrder((prev: any) => ({ ...prev, status: value }))
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
      customerPhone: editedOrder.contactNumber
    }
    
    onSave(updatedOrder)
  }

  const formatOrderTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-alfamart-red">
            Order Details: {order.orderNumber}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View and update the details of this order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Order Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order ID:</span>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Order Time:</span>
                <p className="font-medium">{formatOrderTime(order.timestamp)}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount:</span>
                <p className="font-medium text-alfamart-red">₱{order.totalAmount?.toFixed(2) || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Current Status:</span>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
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

          {/* Email if available */}
          {order.customerEmail && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-700">Email</Label>
              <div className="col-span-3 text-sm text-gray-600 py-2">
                {order.customerEmail}
              </div>
            </div>
          )}
          
          {/* Order Items */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="items" className="text-right text-gray-700">
              Items
            </Label>
            <div className="col-span-3">
              <Textarea
                id="items"
                value={editedOrder?.items || ""}
                onChange={handleChange}
                rows={5}
                className="focus:border-alfamart-blue focus:ring-alfamart-blue"
                placeholder="One item per line"
              />
              <p className="text-xs text-gray-500 mt-1">
                One item per line. Format: quantity x item name
              </p>
            </div>
          </div>
          
          {/* Status Update */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right text-gray-700">
              Status
            </Label>
            <Select value={editedOrder?.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="col-span-3 focus:ring-alfamart-blue">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="pending">New</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Picked Up</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
          <Button 
            onClick={handleSave} 
            className="bg-alfamart-red hover:bg-alfamart-red-dark text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}