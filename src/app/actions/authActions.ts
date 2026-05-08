'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const mobile = formData.get('mobile') as string

  if (!email || !password || !name || !mobile) {
    return { success: false, error: 'All fields are required' }
  }

  const adminClient = createAdminClient()

  // 1. Create user bypassing email confirmation
  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      mobile,
      role: 'customer',
    },
  })

  if (createError) {
    return { success: false, error: createError.message }
  }

  // 2. Sign in the user so their browser gets the session cookie
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { success: false, error: signInError.message }
  }

  return { success: true }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
