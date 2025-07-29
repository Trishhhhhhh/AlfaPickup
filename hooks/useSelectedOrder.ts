"use client"

import { useState } from "react"

let setSelectedOrderFunction: ((order: any) => void) | null = null

export const setSelectedOrder = (order: any) => {
  if (setSelectedOrderFunction) {
    setSelectedOrderFunction(order)
  }
}

export const useSelectedOrder = () => {
  const [selectedOrder, setOrder] = useState<any>(null)

  setSelectedOrderFunction = setOrder

  return [selectedOrder, setSelectedOrder] as const
}
