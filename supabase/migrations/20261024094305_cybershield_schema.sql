/*
# CyberShield core schema

1. New Tables
- `scans`: Records every threat scan a user performs (URL, message, screenshot).
  Columns: id, scan_type (url/message/screenshot), input_text (what the user pasted),
  risk_score (0-100), risk_level (safe/suspicious/dangerous), threat_flags (jsonb array of
  detected threat descriptors), advice (jsonb array of actionable advice strings),
  screenshot_name (for screenshot scans), created_at.
- `incidents`: User-reported cyber fraud incidents with evidence.
  Columns: id, reporter_name, reporter_contact (phone/email), fraud_type, scammer_phone,
  scammer_upi_id, transaction_id, amount_lost, description, incident_date, status
  (submitted/under_review/escalated/resolved), admin_notes, threat_pattern (flag for
  emerging scam patterns), created_at, updated_at, reference_code (human-readable
  tracking code like CS-XXXXXX).
- `scam_patterns`: Admin-managed catalog of emerging scam patterns flagged globally.
  Columns: id, name, description, pattern_type, severity, reported_count, first_seen,
  last_seen, is_active, created_at.
2. Security
- Enable RLS on all three tables.
- `scans`: no-auth app -> anon + authenticated CRUD. Intentionally shared (a scan history
  is per-device/session, stored under a client-generated anonymous session id). USING(true)
  is acceptable because scans are not private user accounts data; this is a public tool.
- `incidents`: public report submission (no login) -> anon + authenticated INSERT + SELECT.
  UPDATE restricted via a SECURITY DEFINER function callable by anon only for status reads
  is unnecessary; instead, status updates are done through the admin path (service role on
  edge function) OR a per-reference-code update policy. For this app, reports are tracked
  by reference_code (public). anon can INSERT and SELECT (to look up status by ref code).
  Only service_role (edge function) can UPDATE status. We grant UPDATE to service_role only.
- `scam_patterns`: public read for everyone (the catalog is educational). Only
  service_role can INSERT/UPDATE (admin-managed). 
3. Important notes
- This is a no-auth single-tenant tool app. There is no sign-in screen. All policies
  target anon + authenticated for public read/write as appropriate.
- reference_code on incidents is generated server-side via DEFAULT to avoid collisions.
- Updated_at auto-touches via trigger.
*/

-- =========================================================
-- scans
-- =========================================================
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  scan_type text NOT NULL CHECK (scan_type IN ('url', 'message', 'screenshot')),
  input_text text,
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text NOT NULL DEFAULT 'safe' CHECK (risk_level IN ('safe', 'suspicious', 'dangerous')),
  threat_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  advice jsonb NOT NULL DEFAULT '[]'::jsonb,
  screenshot_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON scans TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans" ON scans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scans;
CREATE POLICY "anon_update_scans" ON scans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS scans_session_id_idx ON scans (session_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans (created_at desc);

-- =========================================================
-- incidents
-- =========================================================
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text UNIQUE NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  reporter_name text NOT NULL,
  reporter_contact text NOT NULL,
  fraud_type text NOT NULL,
  scammer_phone text,
  scammer_upi_id text,
  transaction_id text,
  amount_lost numeric(14,2) DEFAULT 0,
  description text NOT NULL,
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','escalated','resolved')),
  admin_notes text,
  threat_pattern text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- anon can INSERT (submit reports) and SELECT (track by reference_code)
GRANT SELECT, INSERT ON incidents TO anon, authenticated;
-- Only service_role can UPDATE (admin status changes via edge function)
GRANT UPDATE ON incidents TO service_role;

DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS incidents_reference_code_idx ON incidents (reference_code);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents (status);
CREATE INDEX IF NOT EXISTS incidents_created_at_idx ON incidents (created_at desc);

-- =========================================================
-- scam_patterns
-- =========================================================
CREATE TABLE IF NOT EXISTS scam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  pattern_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  reported_count integer NOT NULL DEFAULT 0,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scam_patterns ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON scam_patterns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON scam_patterns TO service_role;

DROP POLICY IF EXISTS "anon_select_scam_patterns" ON scam_patterns;
CREATE POLICY "anon_select_scam_patterns" ON scam_patterns FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS scam_patterns_active_idx ON scam_patterns (is_active);
CREATE INDEX IF NOT EXISTS scam_patterns_severity_idx ON scam_patterns (severity);

-- =========================================================
-- updated_at trigger for incidents
-- =========================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS incidents_touch_updated_at ON incidents;
CREATE TRIGGER incidents_touch_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =========================================================
-- Seed a few emerging scam patterns for the Indian context
-- =========================================================
INSERT INTO scam_patterns (name, description, pattern_type, severity, reported_count)
VALUES
  ('SBI YONO Reward Expiry', 'Fake SMS claiming SBI YONO reward points are expiring, with a malicious link to a phishing site mimicking SBI.', 'sms', 'high', 1240),
  ('Paytm KYC Verification', 'Fraudulent call/SMS asking users to complete Paytm KYC or face account suspension, harvesting OTP and UPI PIN.', 'sms', 'critical', 2105),
  ('Fake Electricity Bill Disconnection', 'SMS threatening immediate electricity disconnection unless payment is made via a provided link.', 'sms', 'high', 1830),
  ('WhatsApp Part-Time Job Scam', 'Messages offering high-paying part-time work (liking videos, rating products) leading to Telegram task scams.', 'whatsapp', 'high', 1567),
  ('Fraudulent UPI Handle Lookalike', 'UPI IDs mimicking legitimate handles such as @paytm-sbi or @okaxis-verify used to collect fraudulent payments.', 'upi', 'critical', 980),
  ('Indian Railway Ticket Lottery', 'Fake lottery/PR number messages claiming free IRCTC tickets to phish credentials.', 'sms', 'medium', 540),
  ('Fake Customs Parcel Scam', 'Caller claims a parcel in your name contains illegal items, demands payment to clear customs.', 'call', 'high', 720)
ON CONFLICT DO NOTHING;
