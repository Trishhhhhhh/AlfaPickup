import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Package className="w-12 h-12 text-alfamart-blue animate-bounce" />
              </div>
              <h1 className="text-2xl font-bold text-alfamart-blue mb-2">
                Track Your Order
              </h1>
            </div>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              {/* Main loading spinner */}
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-alfamart-blue border-t-transparent"></div>
              </div>
              
              {/* Loading text */}
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">Loading your order details...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch your information</p>
              </div>

              {/* Loading skeleton */}
              <div className="mt-8 space-y-4">
                {/* Order header skeleton */}
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                {/* Customer info skeleton */}
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="bg-gray-100 p-3 rounded-md space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  </div>
                </div>

                {/* Order items skeleton */}
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="bg-gray-100 p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Total skeleton */}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}