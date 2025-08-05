// app/api/orders/route.js

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase with server-only vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  console.log('=== GET /api/orders called ===')
  
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

    if (error) {
      console.error('Supabase GET error:', error)
      throw error
    }

    console.log('GET success, found', data?.length, 'orders')
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
  console.log('=== POST /api/orders called ===')
  
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

    if (error) {
      console.error('Supabase POST error:', error)
      throw error
    }

    console.log('POST success, created order:', order.id)
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
  console.log('=== PATCH /api/orders called ===')
  console.log('Request URL:', request.url)
  console.log('Request method:', request.method)
  
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')
    
    console.log('URL search params:', Object.fromEntries(url.searchParams))
    console.log('Order ID from params:', orderId)
    
    const body = await request.json()
    const { status } = body
    
    console.log('Request body:', body)
    console.log('Status from body:', status)

    if (!orderId) {
      console.error('❌ Missing order ID in PATCH request')
      return NextResponse.json(
        { success: false, error: 'Order ID is required in query parameter ?id=...' },
        { status: 400 }
      )
    }

    if (!status) {
      console.error('❌ Missing status in PATCH request body')
      return NextResponse.json(
        { success: false, error: 'Status is required in request body' },
        { status: 400 }
      )
    }

    console.log('🔄 About to update order in Supabase:', { orderId, status })
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase PATCH error:', error)
      throw error
    }

    if (!data) {
      console.error('❌ No order found with ID:', orderId)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('✅ PATCH success, updated order:', data.id, 'to status:', data.status)
    return NextResponse.json({ success: true, data })
    
  } catch (err) {
    console.error('❌ PATCH /api/orders error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}