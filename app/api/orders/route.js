// app/api/orders/route.js

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// initialize Supabase with server-only vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { customer_id, items, total_amount, status = 'pending' } = await request.json()

    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_id,
          items: JSON.stringify(items),
          total_amount,
          status,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')
    const { status } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('PATCH /api/orders error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}