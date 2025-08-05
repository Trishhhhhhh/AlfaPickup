// Legacy data store - keeping for compatibility with existing components
// New components should use the API functions from lib/api.js instead

import { useRef } from "react"

export const OrderStatus = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
}

// Simple in-memory storage (legacy)
class DataStore {
  constructor() {
    this.orders = []
    this.customers = []
    this.menuItems = []
  }

  addOrder(order) {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    }
    this.orders.push(newOrder)
    return newOrder
  }

  getOrders() {
    return this.orders
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      order.status = status
    }
    return order
  }

  getOrdersByStatus(status) {
    return this.orders.filter((order) => order.status === status)
  }

  onSnapshot(callback) {
    // Immediately provide current orders
    callback(this.orders)

    // Simulate polling updates every second
    const interval = setInterval(() => {
      callback(this.orders)
    }, 1000)

    // Cleanup function
    return () => clearInterval(interval)
  }
}

const dataStore = new DataStore()

// ✅ React-friendly hook to access the dataStore
export function useDataStore() {
  const ref = useRef(dataStore)
  return ref.current
}
