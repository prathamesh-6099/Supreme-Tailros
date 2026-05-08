// =============================================================================
// Supreme Tailors — Database Types
// Mirrors the Supabase schema exactly. Use these throughout the app.
// =============================================================================

export type Role   = 'admin' | 'customer'
export type Status = 'received' | 'in_progress' | 'ready'
export type MeasurementType = 'shirt' | 'pant'
export type SmsStatus = 'sent' | 'failed' | 'pending'

// ── profiles ─────────────────────────────────────────────────────────────────
export interface Profile {
  id:         string
  name:       string
  mobile:     string
  role:       Role
  created_at: string
}

// ── orders ───────────────────────────────────────────────────────────────────
export interface Order {
  id:            string
  customer_id:   string
  order_number:  number
  delivery_date: string        // 'YYYY-MM-DD'
  status:        Status
  notes:         string | null
  created_at:    string
  updated_at:    string
}

// Order with joined customer profile (used in admin dashboard)
export interface OrderWithCustomer extends Order {
  profiles: Pick<Profile, 'name' | 'mobile'>
}

// ── measurements ─────────────────────────────────────────────────────────────
export interface ShirtMeasurements {
  neck:           string
  chest:          string
  waist:          string
  shoulder:       string
  sleeve_length:  string
  shirt_length:   string
  unit:           'cm' | 'inches'
}

export interface PantMeasurements {
  waist:       string
  seat:        string
  thigh:       string
  knee:        string
  bottom:      string
  inseam:      string
  pant_length: string
  unit:        'cm' | 'inches'
}

export interface Measurement {
  id:         string
  order_id:   string
  type:       MeasurementType
  data:       ShirtMeasurements | PantMeasurements
  created_at: string
}

// ── sms_logs ─────────────────────────────────────────────────────────────────
export interface SmsLog {
  id:       string
  order_id: string
  mobile:   string
  message:  string
  status:   SmsStatus
  sent_at:  string
}

// ── Supabase Database generic type (for createClient<Database>()) ─────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      orders: {
        Row:    Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>
      }
      measurements: {
        Row:    Measurement
        Insert: Omit<Measurement, 'id' | 'created_at'>
        Update: Partial<Omit<Measurement, 'id' | 'created_at'>>
      }
      sms_logs: {
        Row:    SmsLog
        Insert: Omit<SmsLog, 'id' | 'sent_at'>
        Update: Partial<Omit<SmsLog, 'id'>>
      }
    }
    Functions: {
      is_admin: {
        Args:    Record<string, never>
        Returns: boolean
      }
    }
  }
}
