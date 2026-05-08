'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface MeasurementData {
  [key: string]: string
}

export interface CreateOrderInput {
  // Customer
  name:         string
  mobile:       string
  // Order
  deliveryDate: string
  notes:        string
  // Measurements (undefined = not filled by admin)
  shirt?: MeasurementData & { unit: 'cm' | 'inches' }
  pant?:  MeasurementData & { unit: 'cm' | 'inches' }
}

export type CreateOrderResult =
  | { success: true;  orderId: string }
  | { success: false; error: string }

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const adminClient = createAdminClient()

  // ── 1. Find or create customer profile ────────────────────────────────────
  let customerId: string

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('mobile', input.mobile.trim())
    .maybeSingle()   // returns null (not error) when no row found

  if (existingProfile) {
    // Reuse existing profile
    customerId = existingProfile.id
  } else {
    // Create a new auth user → trigger auto-creates profile row
    // Email: <mobile>@supremetailors.local (placeholder, not sent anywhere)
    const placeholderEmail = `${input.mobile.trim()}@supremetailors.local`

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email:         placeholderEmail,
        password:      crypto.randomUUID(),   // random password — admin-managed account
        user_metadata: {
          name:   input.name.trim(),
          mobile: input.mobile.trim(),
          role:   'customer',
        },
        email_confirm: true, // skip email verification for admin-created accounts
      })

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message ?? 'Failed to create customer account',
      }
    }

    customerId = authData.user.id

    // The trigger should have created the profile; update to be safe
    await adminClient
      .from('profiles')
      .upsert({
        id:     customerId,
        name:   input.name.trim(),
        mobile: input.mobile.trim(),
        role:   'customer',
      })
      .eq('id', customerId)
  }

  // ── 2. Insert order ────────────────────────────────────────────────────────
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      customer_id:   customerId,
      delivery_date: input.deliveryDate,
      notes:         input.notes.trim() || null,
      status:        'received',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return {
      success: false,
      error: orderError?.message ?? 'Failed to create order',
    }
  }

  // ── 3. Insert measurements (only if at least one field filled) ─────────────
  const measurementInserts: { order_id: string; type: string; data: MeasurementData }[] = []

  if (input.shirt && hasAnyValue(input.shirt)) {
    measurementInserts.push({ order_id: order.id, type: 'shirt', data: input.shirt })
  }
  if (input.pant && hasAnyValue(input.pant)) {
    measurementInserts.push({ order_id: order.id, type: 'pant', data: input.pant })
  }

  if (measurementInserts.length > 0) {
    const { error: measError } = await adminClient
      .from('measurements')
      .insert(measurementInserts)

    if (measError) {
      return { success: false, error: measError.message }
    }
  }

  // Bust the dashboard cache so the new order appears instantly
  revalidatePath('/admin/dashboard')

  return { success: true, orderId: order.id }
}

/** Returns true if any key besides 'unit' has a non-empty value */
function hasAnyValue(data: MeasurementData): boolean {
  return Object.entries(data).some(
    ([key, val]) => key !== 'unit' && val.trim() !== ''
  )
}
