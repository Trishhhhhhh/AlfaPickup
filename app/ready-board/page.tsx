import { ReadyForPickupList } from "@/components/ready-for-pickup-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ReadyBoardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-alfamart-gray to-white p-6 flex flex-col items-center">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-dark-purple">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Home</span>
        </Button>
      </Link>
      <ReadyForPickupList />
    </div>
  )
}
