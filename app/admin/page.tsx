import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AdminOrderTable } from "@/components/admin-order-table"

export default function AdminDashboardPage() {
  return (
    <div className="relative">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-alfamart-blue">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Home</span>
        </Button>
      </Link>
      <AdminOrderTable />
    </div>
  )
}
