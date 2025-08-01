import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Debug environment variables
console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  console.log('=== GET /api/customer called ===');
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase GET error:', error);
      throw error;
    }

    console.log('GET success, found', data?.length, 'customers');
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  console.log('=== POST /api/customer called ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, phone, email } = body;
    
    if (!name || !phone) {
      console.error('Missing required fields:', { name: !!name, phone: !!phone });
      throw new Error('Name and phone are required');
    }

    console.log('Checking for existing customer with phone:', phone);
    
    // Check if customer already exists by phone
    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 means "no rows returned" which is expected if customer doesn't exist
      console.error('Error checking existing customer:', existingError);
      throw existingError;
    }

    if (existing) {
      console.log('Found existing customer:', existing.id);
      return NextResponse.json({ success: true, data: existing })
    }

    console.log('Creating new customer...');
    
    // Create new customer
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, phone, email }])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    console.log('Customer created successfully:', data.id);
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}