"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { getMenuItems, createCustomer, createOrder } from "@/lib/api"
import { PrintService } from "@/lib/printService"
import Link from "next/link"

// 🔍 DEBUG COMPONENT - TEMPORARY
const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState("")

  const runDebugTest = () => {
    const info = []
    info.push("=== PDA DEBUG INFO ===")
    info.push(`Hostname: ${window.location.hostname}`)
    info.push(`User Agent: ${navigator.userAgent.substring(0, 50)}...`)
    info.push("")

    // Check for printer bridges
    const bridges = ["Android", "printer", "device", "sunmi", "newland", "urovo", "citaq", "pos"]

    bridges.forEach((bridge) => {
      const exists = !!window[bridge]
      const hasFunc = window[bridge]?.printText || window[bridge]?.print
      info.push(`${bridge}: ${exists ? "✅" : "❌"} ${hasFunc ? "(has print)" : ""}`)
    })

    info.push("")
    info.push("Available window properties:")
    const props = Object.keys(window).filter(
      (key) =>
        key.toLowerCase().includes("print") ||
        key.toLowerCase().includes("android") ||
        key.toLowerCase().includes("device"),
    )
    info.push(props.join(", ") || "None found")

    // Test PrintService detection
    info.push("")
    info.push(`PrintService.isAndroidPDA(): ${PrintService.isAndroidPDA()}`)

    setDebugInfo(info.join("\n"))
  }

  const testPrint = () => {
    const testData = {
      id: "DEBUG-001",
      customerName: "Debug Test",
      customerPhone: "09123456789",
      items: [{ name: "Test Item", quantity: 1, price: 50 }],
      total: 50,
    }

    alert("🔍 Testing print... Check console and watch for alerts!")
    PrintService.printReceipt(testData)
  }

  return (
    <Card className="mb-2 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">🔍 Debug Mode (Remove Later)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex gap-2">
          <Button onClick={runDebugTest} size="sm" variant="outline" className="text-xs bg-transparent">
            Check PDA Info
          </Button>
          <Button onClick={testPrint} size="sm" variant="outline" className="text-xs bg-transparent">
            Test Print
          </Button>
        </div>

        {debugInfo && <pre className="text-[8px] bg-gray-100 p-2 rounded overflow-auto max-h-32">{debugInfo}</pre>}
      </CardContent>
    </Card>
  )
}

export default function OrderPage() {
  const [mounted, setMounted] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" })
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems()
      setMenuItems(items)
    } catch (error) {
      console.error("Failed to load menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(itemId)
    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const submitOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!customer.name || !customer.phone) throw new Error("Customer information is incomplete")
      if (!cart.length) throw new Error("Cart is empty")

      const customerData = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
      }

      const customerResponse = await createCustomer(customerData)

      const orderData = {
        customer_id: customerResponse.id,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_amount: calculateTotal(),
        status: "pending",
      }

      const orderResponse = await createOrder(orderData)

      // 🖨️ AUTOMATIC RECEIPT PRINTING
      const receiptData = {
        id: orderResponse.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotal(),
      }

      // Print receipt automatically
      console.log("🖨️ Printing receipt for order:", orderResponse.id)
      await PrintService.printReceipt(receiptData)

      // 🚀 AUTOMATIC REDIRECT TO TRACK ORDER PAGE
      // Instead of showing success screen, redirect immediately
      router.push(`/track-order?orderId=${orderResponse.id}`)

      // Reset form state
      setCart([])
      setCustomer({ name: "", phone: "", email: "" })
    } catch (error) {
      console.error("❌ Error creating order:", error)
      alert(`Failed to place order: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-alfamart-blue/5 font-sans">
      {/* Mobile Header matching dashboard style */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-alfamart-blue to-alfamart-red border-b-2 border-alfamart-yellow shadow-lg">
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-white hover:text-alfamart-yellow transition-colors">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <h1 className="text-sm sm:text-lg font-black text-white tracking-wide drop-shadow-sm">Place Order</h1>
            </div>
            {cart.length > 0 && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                <ShoppingCart className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">{cart.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        {/* 🔍 DEBUG COMPONENT - TEMPORARY */}
        <DebugInfo />

        {/* Mobile-optimized layout */}
        <div className="space-y-3">
          {/* Menu Items Section */}
          <Card className="shadow-md border-2 border-alfamart-blue/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ShoppingCart className="h-4 w-4 text-alfamart-blue" />
                Menu Items
              </CardTitle>
              <CardDescription className="text-xs">Select items to add to your cart</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Input
                type="text"
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 text-sm"
              />

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-alfamart-blue border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading menu items...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems
                    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="border border-gray-200 hover:border-alfamart-yellow transition-colors"
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3 items-center">
                            {/* Menu image - mobile optimized */}
                            {item.image_url && (
                              <img
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-bold text-alfamart-blue truncate">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-alfamart-red text-white text-xs font-bold">₱{item.price}</Badge>
                                {item.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              disabled={!item.available}
                              className="bg-alfamart-blue hover:bg-alfamart-red text-white flex-shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart Section - Mobile optimized */}
          {cart.length > 0 && (
            <Card className="shadow-md border-2 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  Your Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-alfamart-blue truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          ₱{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-alfamart-blue">Total:</span>
                    <span className="text-alfamart-red">₱{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Info Section - Mobile optimized */}
          <form onSubmit={submitOrder} className="space-y-3">
            <Card className="shadow-md border-2 border-alfamart-yellow/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base text-alfamart-blue">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <Label htmlFor="name" className="text-sm font-bold">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                    className="text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-bold">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                    className="text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-bold">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button - Mobile optimized */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-alfamart-blue to-alfamart-red hover:from-alfamart-red hover:to-alfamart-blue text-white font-bold py-3 text-sm shadow-lg transform hover:scale-105 transition-all duration-200"
              disabled={submitting || cart.length === 0}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Placing Order...
                </div>
              ) : (
                `Place Order (₱${calculateTotal().toFixed(2)})`
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
