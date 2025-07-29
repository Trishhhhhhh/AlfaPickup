import { v4 as uuidv4 } from "uuid"

export type OrderStatus = "New" | "Preparing" | "Ready" | "Picked Up" | "Cancelled"

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  contactNumber: string
  items: string[]
  status: OrderStatus
  timestamp: string
}

// In-memory store for simulation
const orders: Order[] = []
const listeners: ((orders: Order[]) => void)[] = []

// Initial dummy data for demonstration
if (orders.length === 0) {
  const now = Date.now()
  orders.push({
    id: uuidv4(),
    orderNumber: "#1001",
    customerName: "Alice Smith",
    contactNumber: "555-1234",
    items: ["1x Classic Burger", "1x Fries", "1x Coke"],
    status: "New",
    timestamp: new Date(now - 3600000).toISOString(), // 1 hour ago
  })
  orders.push({
    id: uuidv4(),
    orderNumber: "#1002",
    customerName: "Bob Johnson",
    contactNumber: "555-5678",
    items: ["2x Pepperoni Pizza", "1x Garlic Knots"],
    status: "Preparing",
    timestamp: new Date(now - 1800000).toISOString(), // 30 mins ago
  })
  orders.push({
    id: uuidv4(),
    orderNumber: "#1003",
    customerName: "Charlie Brown",
    contactNumber: "555-9012",
    items: ["1x Chicken Sandwich", "1x Onion Rings"],
    status: "Ready",
    timestamp: new Date(now - 600000).toISOString(), // 10 mins ago
  })
  orders.push({
    id: uuidv4(),
    orderNumber: "#1004",
    customerName: "Diana Prince",
    contactNumber: "N/A",
    items: ["3x Tacos", "1x Guacamole"],
    status: "New",
    timestamp: new Date(now - 120000).toISOString(), // 2 mins ago
  })
  orders.push({
    id: uuidv4(),
    orderNumber: "#1005",
    customerName: "Eve Adams",
    contactNumber: "555-3333",
    items: ["1x Vegan Bowl"],
    status: "Picked Up",
    timestamp: new Date(now - 7200000).toISOString(), // 2 hours ago
  })
  orders.push({
    id: uuidv4(),
    orderNumber: "#1006",
    customerName: "Frank White",
    contactNumber: "555-4444",
    items: ["1x Large Pizza"],
    status: "Cancelled",
    timestamp: new Date(now - 1000000).toISOString(), // ~16 mins ago
  })
}

const notifyListeners = () => {
  listeners.forEach((callback) => callback([...orders]))
}

export const simulateFirebase = {
  // Simulate adding an order (used by customer form)
  addOrder: (order: Omit<Order, "id" | "status" | "timestamp">) => {
    const newOrder: Order = {
      id: uuidv4(),
      status: "New",
      timestamp: new Date().toISOString(),
      ...order,
    }
    orders.push(newOrder)
    notifyListeners()
    return newOrder
  },

  // Simulate updating an order status
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId)
    if (orderIndex > -1) {
      orders[orderIndex].status = newStatus
      notifyListeners()
    }
  },

  // Simulate updating an entire order object
  updateOrder: (updatedOrder: Order) => {
    const orderIndex = orders.findIndex((o) => o.id === updatedOrder.id)
    if (orderIndex > -1) {
      orders[orderIndex] = updatedOrder
      notifyListeners()
    }
  },

  // Simulate cancelling an order
  cancelOrder: (orderId: string) => {
    simulateFirebase.updateOrderStatus(orderId, "Cancelled")
  },

  // Simulate a real-time listener (Firestore onSnapshot)
  onSnapshot: (callback: (orders: Order[]) => void) => {
    listeners.push(callback)
    // Immediately call with current data
    callback([...orders])
    return () => {
      // Simulate unsubscribe
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  },

  // Simulate fetching all orders (for admin table)
  getAllOrders: (): Order[] => {
    return [...orders]
  },
}
