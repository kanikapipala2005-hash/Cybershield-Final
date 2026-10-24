import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/admin-actions', '');

    // GET /incidents — list all incidents for admin
    if (req.method === 'GET' && path === '/incidents') {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /incidents/:id — update status
    if (req.method === 'PUT' && path.startsWith('/incidents/')) {
      const id = path.split('/')[2];
      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.status) updates.status = body.status;
      if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
      if (body.threat_pattern !== undefined) updates.threat_pattern = body.threat_pattern;

      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /stats — dashboard statistics
    if (req.method === 'GET' && path === '/stats') {
      const [incidents, scans, patterns] = await Promise.all([
        supabase.from('incidents').select('status, fraud_type, created_at'),
        supabase.from('scans').select('risk_level, scan_type, created_at'),
        supabase.from('scam_patterns').select('*').order('reported_count', { ascending: false }),
      ]);

      const stats = {
        total_incidents: incidents.data?.length || 0,
        total_scans: scans.data?.length || 0,
        status_breakdown: {
          submitted: incidents.data?.filter((i: any) => i.status === 'submitted').length || 0,
          under_review: incidents.data?.filter((i: any) => i.status === 'under_review').length || 0,
          escalated: incidents.data?.filter((i: any) => i.status === 'escalated').length || 0,
          resolved: incidents.data?.filter((i: any) => i.status === 'resolved').length || 0,
        },
        fraud_type_breakdown: incidents.data?.reduce((acc: Record<string, number>, i: any) => {
          acc[i.fraud_type] = (acc[i.fraud_type] || 0) + 1;
          return acc;
        }, {}) || {},
        risk_breakdown: {
          safe: scans.data?.filter((s: any) => s.risk_level === 'safe').length || 0,
          suspicious: scans.data?.filter((s: any) => s.risk_level === 'suspicious').length || 0,
          dangerous: scans.data?.filter((s: any) => s.risk_level === 'dangerous').length || 0,
        },
        scan_type_breakdown: scans.data?.reduce((acc: Record<string, number>, s: any) => {
          acc[s.scan_type] = (acc[s.scan_type] || 0) + 1;
          return acc;
        }, {}) || {},
        patterns: patterns.data || [],
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});