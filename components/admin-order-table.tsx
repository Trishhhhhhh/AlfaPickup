"use client"

import React, { useEffect, useState } from "react"
import { useDataStore } from "@/lib/stores/dataStore"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  items?: OrderItem[]
}

export function AdminOrderTable() {
  const dataStore = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [allOrders, setAllOrders] = useState<Order[]>([])

  useEffect(() => {
    const unsubscribe = dataStore.onSnapshot((updatedOrders: Order[]) => {
      setAllOrders(updatedOrders)
    })
    return () => unsubscribe()
  }, [dataStore])

  const filtered = allOrders.filter((order) => {
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "All" ||
      order.status === statusFilter ||
      (statusFilter === "Ready" && order.status.toLowerCase() === "ready")
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search by Order #"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Preparing">Preparing</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <div>
                  {order.items?.map((item, index) => (
                    <p key={index}>
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
