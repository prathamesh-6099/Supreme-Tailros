'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath }    from 'next/cache'
import type { Status }       from '@/lib/types/database'

// ─── Update order status ──────────────────────────────────────────────────────
export async function updateStatusAction(
  orderId:   string,
  newStatus: Status
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  // If status moved to 'ready', fire SMS
  if (newStatus === 'ready') {
    const smsResult = await sendReadySmsAction(orderId)
    if (!smsResult.success) {
      // SMS failed — log the reason but don't block the status update
      console.error('SMS failed:', smsResult.error)
    }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Send "ready" SMS via Fast2SMS ───────────────────────────────────────────
export async function sendReadySmsAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Fetch order + customer profile
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, profiles ( name, mobile )')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return { success: false, error: orderErr?.message ?? 'Order not found' }
  }

  type OrderWithProfile = { id: string; profiles: { name: string; mobile: string } | null }
  const profile = (order as unknown as OrderWithProfile).profiles
  if (!profile?.mobile) {
    return { success: false, error: 'Customer mobile not found' }
  }

  const message =
    `Dear ${profile.name}, your clothes are ready at Supreme Tailors! ` +
    `Please visit us for pickup. Thank you.`

  // Call Fast2SMS API
  let smsStatus: 'sent' | 'failed' = 'failed'
  let smsError: string | undefined

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method:  'POST',
      headers: {
        authorization:  process.env.FAST2SMS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route:    'q',
        message,
        language: 'english',
        flash:    0,
        numbers:  profile.mobile,
      }),
    })

    const json = await response.json()
    if (json.return === true) {
      smsStatus = 'sent'
    } else {
      smsError = json.message?.[0] ?? 'Fast2SMS error'
    }
  } catch (err: unknown) {
    smsError = err instanceof Error ? err.message : 'Network error calling Fast2SMS'
  }

  // Log SMS attempt (use admin client so RLS doesn't block)
  const adminClient = createAdminClient()
  await adminClient.from('sms_logs').insert({
    order_id: orderId,
    mobile:   profile.mobile,
    message,
    status:   smsStatus,
  })

  if (smsStatus === 'failed') {
    return { success: false, error: smsError ?? 'SMS not sent' }
  }
  return { success: true }
}

// ─── Update delivery date + notes ─────────────────────────────────────────────
export async function updateOrderDetailsAction(
  orderId:      string,
  deliveryDate: string,
  notes:        string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({
      delivery_date: deliveryDate,
      notes:         notes.trim() || null,
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/dashboard')
  return { success: true }
}
