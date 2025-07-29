import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, LayoutDashboard, ListChecks } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-alfamart-gray to-white p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img src="/android-chrome-192x192.png" alt="AlfaPickup Logo" className="h-20 w-20 rounded-lg shadow-lg" />
        </div>
        <h1 className="text-5xl font-bold text-alfamart-red mb-4">AlfaPickup</h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Your seamless solution for managing pickup-only restaurant orders. Place orders, track status, and get ready
          for pickup!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-col items-center text-center">
            <UtensilsCrossed className="h-12 w-12 text-alfamart-blue mb-4" />
            <CardTitle className="text-2xl text-alfamart-blue">Place an Order</CardTitle>
            <CardDescription className="mt-2">Customers can easily place new orders for pickup.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/order">
              <Button className="bg-alfamart-red hover:bg-alfamart-red-dark text-white text-lg px-8 py-6 rounded-full shadow-md">
                Order Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-col items-center text-center">
            <LayoutDashboard className="h-12 w-12 text-alfamart-blue mb-4" />
            <CardTitle className="text-2xl text-alfamart-blue">Staff Dashboard</CardTitle>
            <CardDescription className="mt-2">Manage orders in real-time, move them through stages.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard">
              <Button className="bg-alfamart-red hover:bg-alfamart-red-dark text-white text-lg px-8 py-6 rounded-full shadow-md">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-col items-center text-center">
            <ListChecks className="h-12 w-12 text-alfamart-blue mb-4" />
            <CardTitle className="text-2xl text-alfamart-blue">Ready for Pickup</CardTitle>
            <CardDescription className="mt-2">Public display of orders ready for customer pickup.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/ready-board">
              <Button className="bg-alfamart-red hover:bg-alfamart-red-dark text-white text-lg px-8 py-6 rounded-full shadow-md">
                View Pickup Board
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
