import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css" // Ensure this is correctly imported

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pickup-Only Restaurant Order Dashboard",
  description: "Manage pickup orders in real-time.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* DEBUGGING: If Tailwind is working, this body should be red */}
      <body className={`${inter.className} bg-red-500`}>{children}</body>
    </html>
  )
}
