'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabase = createSupabaseClient();

export type Database = {
  scans: {
    id: string;
    session_id: string;
    scan_type: 'url' | 'message' | 'screenshot';
    input_text: string | null;
    risk_score: number;
    risk_level: 'safe' | 'suspicious' | 'dangerous';
    threat_flags: string[];
    advice: string[];
    screenshot_name: string | null;
    created_at: string;
  };
  incidents: {
    id: string;
    reference_code: string;
    reporter_name: string;
    reporter_contact: string;
    fraud_type: string;
    scammer_phone: string | null;
    scammer_upi_id: string | null;
    transaction_id: string | null;
    amount_lost: number;
    description: string;
    incident_date: string;
    status: 'submitted' | 'under_review' | 'escalated' | 'resolved';
    admin_notes: string | null;
    threat_pattern: string | null;
    created_at: string;
    updated_at: string;
  };
  scam_patterns: {
    id: string;
    name: string;
    description: string;
    pattern_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reported_count: number;
    first_seen: string;
    last_seen: string;
    is_active: boolean;
    created_at: string;
  };
};