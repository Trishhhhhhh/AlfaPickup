'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabase = () => {
  return createServerComponentClient({ cookies })
}
