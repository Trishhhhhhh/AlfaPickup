import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, phone, email } = await request.json()

    // Check if customer already exists by phone
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, data: existing })
    }

    // Create new customer
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, phone, email }])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}