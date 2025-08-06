'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase' // Optional: if you use Supabase types

const createClient = () => {
  return createServerComponentClient<Database>({ cookies }) // remove <Database> if you're not using types
}

export default createClient
