"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Download, Edit, XCircle, Archive } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { dataStore, type Order, type OrderStatus } from "@/lib/data-store"
import { ModalOrderDetails } from "./modal-order-details"
import { cn } from "@/lib/utils"

export function AdminOrderTable() {
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All")
  const [sortColumn, setSortColumn] = useState<keyof Order>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const orderStatuses: OrderStatus[] = ["New", "Preparing", "Ready", "Picked Up", "Cancelled"]

  useEffect(() => {
    const unsubscribe = dataStore.onSnapshot((updatedOrders) => {
      setAllOrders(updatedOrders)
    })
    return () => unsubscribe()
  }, [])

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = allOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "All" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (sortColumn === "timestamp") {
        const dateA = new Date(aValue as string).getTime()
        const dateB = new Date(bValue as string).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      return 0
    })

    return filtered
  }, [allOrders, searchTerm, statusFilter, sortColumn, sortDirection])

  const handleSort = (column: keyof Order) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleCancelOrder = (orderId: string) => {
    dataStore.cancelOrder(orderId)
    toast({
      title: "Order Cancelled",
      description: `Order ${orderId} has been marked as cancelled.`,
      variant: "destructive",
    })
  }

  const handleArchiveOrder = (orderId: string) => {
    dataStore.updateOrderStatus(orderId, "Picked Up")
    toast({
      title: "Order Archived",
      description: `Order ${orderId} has been marked as picked up.`,
    })
  }

  const handleModalSave = useCallback((updatedOrder: Order) => {
    dataStore.updateOrder(updatedOrder)
    toast({
      title: "Order Updated",
      description: `Order ${updatedOrder.orderNumber} details saved.`,
    })
    setIsModalOpen(false)
    setSelectedOrder(null)
  }, [])

  const exportToCSV = () => {
    if (filteredAndSortedOrders.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no orders matching your current filters to export.",
        variant: "destructive",
      })
      return
    }

    const headers = ["Order Number", "Customer Name", "Contact Number", "Items", "Status", "Timestamp"]
    const rows = filteredAndSortedOrders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.contactNumber,
      order.items.join("; "), // Join items with a semicolon for CSV
      order.status,
      new Date(order.timestamp).toLocaleString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${field}"`).join(",")), // Quote fields to handle commas in data
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "orders_export.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "CSV Exported",
        description: "Order data has been successfully exported.",
      })
    }
  }

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Preparing":
        return "bg-yellow-100 text-yellow-800"
      case "Ready":
        return "bg-green-100 text-green-800"
      case "Picked Up":
        return "bg-gray-100 text-gray-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-alfamart-gray to-white min-h-screen">
      <h1 className="text-4xl font-bold text-center text-alfamart-red mb-8">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white shadow-sm focus:border-alfamart-blue focus:ring-alfamart-blue"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "All")}>
          <SelectTrigger className="w-[180px] bg-white shadow-sm focus:ring-alfamart-blue">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="All">All Statuses</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV} className="bg-alfamart-red hover:bg-alfamart-red-dark text-white shadow-md">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-lg border shadow-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {" "}
          {/* Add this wrapper for horizontal scrolling */}
          <Table>
            <TableHeader>
              <TableRow className="bg-alfamart-blue text-white">
                <TableHead className="cursor-pointer hover:bg-lavender-100" onClick={() => handleSort("orderNumber")}>
                  Order #
                  <ArrowUpDown
                    className={cn("ml-2 h-4 w-4 inline", sortColumn === "orderNumber" && "text-alfamart-yellow")}
                  />
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-lavender-100" onClick={() => handleSort("customerName")}>
                  Customer
                  <ArrowUpDown
                    className={cn("ml-2 h-4 w-4 inline", sortColumn === "customerName" && "text-alfamart-yellow")}
                  />
                </TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="cursor-pointer hover:bg-lavender-100" onClick={() => handleSort("status")}>
                  Status
                  <ArrowUpDown
                    className={cn("ml-2 h-4 w-4 inline", sortColumn === "status" && "text-alfamart-yellow")}
                  />
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-lavender-100" onClick={() => handleSort("timestamp")}>
                  Time
                  <ArrowUpDown
                    className={cn("ml-2 h-4 w-4 inline", sortColumn === "timestamp" && "text-alfamart-yellow")}
                  />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    No orders found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-lavender-50">
                    <TableCell className="font-medium text-alfamart-blue">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm">
                        {order.items.map((item, index) => (
                          <li key={index} className="truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadgeColor(order.status))}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(order.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                        className="text-alfamart-blue border-alfamart-blue/50 hover:bg-alfamart-blue/10"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {order.status !== "Cancelled" && order.status !== "Picked Up" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      )}
                      {order.status === "Ready" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveOrder(order.id)}
                          className="text-alfamart-blue border-alfamart-blue/50 hover:bg-alfamart-blue/10"
                        >
                          <Archive className="h-4 w-4" />
                          <span className="sr-only">Archive</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>{" "}
        {/* Close the overflow-x-auto wrapper */}
      </div>

      <ModalOrderDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSave={handleModalSave}
      />
    </div>
  )
}
