-- =============================================================================
-- Supreme Tailors — Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS
-- =============================================================================


-- =============================================================================
-- 1. PROFILES
--    Must be created FIRST — is_admin() references this table.
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  mobile     TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'customer'
                         CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for mobile lookups (used when creating orders)
CREATE INDEX IF NOT EXISTS profiles_mobile_idx ON profiles (mobile);


-- =============================================================================
-- 2. HELPER: is_admin()
--    Defined AFTER profiles so the table reference resolves correctly.
--    Uses plpgsql (not sql) to defer name resolution to execution time.
-- =============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id   = auth.uid()
      AND role = 'admin'
  );
END;
$$;


-- =============================================================================
-- 3. RLS — PROFILES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so re-running is safe
DROP POLICY IF EXISTS "Admin: full access on profiles"          ON profiles;
DROP POLICY IF EXISTS "Customer: read own profile"              ON profiles;
DROP POLICY IF EXISTS "Customer: update own profile"            ON profiles;
DROP POLICY IF EXISTS "Customer: insert own profile on signup"  ON profiles;

-- Admin: full access
CREATE POLICY "Admin: full access on profiles"
  ON profiles FOR ALL
  USING      (is_admin())
  WITH CHECK (is_admin());

-- Customer: read own row only
CREATE POLICY "Customer: read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Customer: update own row
CREATE POLICY "Customer: update own profile"
  ON profiles FOR UPDATE
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert during self-registration
CREATE POLICY "Customer: insert own profile on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- =============================================================================
-- 4. ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number  SERIAL      NOT NULL UNIQUE,
  delivery_date DATE        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'received'
                            CHECK (status IN ('received', 'in_progress', 'ready')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_delivery_date_idx ON orders (delivery_date ASC);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx   ON orders (customer_id);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin: full access on orders"  ON orders;
DROP POLICY IF EXISTS "Customer: read own orders"     ON orders;

CREATE POLICY "Admin: full access on orders"
  ON orders FOR ALL
  USING      (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Customer: read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);


-- =============================================================================
-- 5. MEASUREMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS measurements (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('shirt', 'pant')),
  data       JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS measurements_order_id_idx ON measurements (order_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin: full access on measurements" ON measurements;
DROP POLICY IF EXISTS "Customer: read own measurements"    ON measurements;

CREATE POLICY "Admin: full access on measurements"
  ON measurements FOR ALL
  USING      (is_admin())
  WITH CHECK (is_admin());

-- Customer reads measurements only for their own orders
CREATE POLICY "Customer: read own measurements"
  ON measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id          = measurements.order_id
        AND orders.customer_id = auth.uid()
    )
  );


-- =============================================================================
-- 6. SMS_LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS sms_logs (
  id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  mobile   TEXT        NOT NULL,
  message  TEXT        NOT NULL,
  status   TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sms_logs_order_id_idx ON sms_logs (order_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin: full access on sms_logs" ON sms_logs;

-- Admin only — customers never see SMS logs
CREATE POLICY "Admin: full access on sms_logs"
  ON sms_logs FOR ALL
  USING      (is_admin())
  WITH CHECK (is_admin());


-- =============================================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP
--    Fires after a new row in auth.users, reads raw_user_meta_data
--    (name, mobile, role) set during signUp() call in the app.
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, mobile, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',   'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'role',   'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- 8. SEED: CREATE ADMIN PROFILE ROW
--    STEP 1 — Go to Supabase → Authentication → Users → Add User
--             Email: admin@supremetailors.com  (set a strong password)
--    STEP 2 — Copy the UUID of that user
--    STEP 3 — Uncomment the block below, paste the UUID, and run it.
-- =============================================================================
INSERT INTO profiles (id, name, mobile, role)
VALUES (
  '11a52c4f-0c9e-44bd-b354-886253d0e24e',
  'Shop Owner',
  '9999999999',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';


-- =============================================================================
-- Done!
--   ✓ profiles     — RLS enabled
--   ✓ orders       — RLS enabled, updated_at trigger
--   ✓ measurements — RLS enabled
--   ✓ sms_logs     — RLS enabled (admin only)
--   ✓ is_admin()   — helper function (defined after profiles)
--   ✓ handle_new_user() → on_auth_user_created trigger
--   ✓ update_updated_at() → orders_updated_at trigger
-- =============================================================================
