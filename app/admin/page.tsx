'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Loader2, AlertTriangle, TrendingUp, FileWarning, Activity, Search, Filter, Phone, Globe, ChevronDown } from 'lucide-react';

const ADMIN_PASSCODE = 'cybershield-admin-2026';

type Incident = {
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

type Stats = {
  total_incidents: number;
  total_scans: number;
  status_breakdown: Record<string, number>;
  fraud_type_breakdown: Record<string, number>;
  risk_breakdown: Record<string, number>;
  scan_type_breakdown: Record<string, number>;
  patterns: { id: string; name: string; severity: string; reported_count: number; pattern_type: string }[];
};

const STATUS_FLOW = ['submitted', 'under_review', 'escalated', 'resolved'];
const STATUS_COLORS: Record<string, string> = {
  submitted: 'border-primary/40 bg-primary/10 text-primary',
  under_review: 'border-warning/40 bg-warning/10 text-warning',
  escalated: 'border-destructive/40 bg-destructive/10 text-destructive',
  resolved: 'border-accent/40 bg-accent/10 text-accent',
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthed(true);
      setError(null);
    } else {
      setError('Invalid admin passcode.');
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/60 p-8 glow-cyan">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 font-mono-cyber text-xl font-bold">Admin Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the admin passcode to access the protected dashboard.
            </p>
          </div>
          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="passcode" className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Admin Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 bg-background-2/40 font-mono-cyber"
                placeholder="Enter passcode"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Shield className="mr-2 h-4 w-4" /> Access Dashboard
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo passcode: <span className="font-mono-cyber text-primary">cybershield-admin-2026</span>
            </p>
          </form>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, statsRes] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('scans').select('risk_level, scan_type'),
      ]);

      if (incRes.data) setIncidents(incRes.data as Incident[]);

      if (statsRes.data) {
        const scanData = statsRes.data as { risk_level: string; scan_type: string }[];
        const incidentData = (incRes.data as Incident[]) || [];
        const statusBreakdown: Record<string, number> = {};
        const fraudBreakdown: Record<string, number> = {};
        const riskBreakdown: Record<string, number> = {};
        const scanTypeBreakdown: Record<string, number> = {};

        STATUS_FLOW.forEach((s) => (statusBreakdown[s] = 0));
        incidentData.forEach((i) => {
          statusBreakdown[i.status] = (statusBreakdown[i.status] || 0) + 1;
          fraudBreakdown[i.fraud_type] = (fraudBreakdown[i.fraud_type] || 0) + 1;
        });
        scanData.forEach((s) => {
          riskBreakdown[s.risk_level] = (riskBreakdown[s.risk_level] || 0) + 1;
          scanTypeBreakdown[s.scan_type] = (scanTypeBreakdown[s.scan_type] || 0) + 1;
        });

        const { data: patternData } = await supabase
          .from('scam_patterns')
          .select('id, name, severity, reported_count, pattern_type')
          .order('reported_count', { ascending: false });

        setStats({
          total_incidents: incidentData.length,
          total_scans: scanData.length,
          status_breakdown: statusBreakdown,
          fraud_type_breakdown: fraudBreakdown,
          risk_breakdown: riskBreakdown,
          scan_type_breakdown: scanTypeBreakdown,
          patterns: (patternData as Stats['patterns']) || [],
        });
      }
    } catch (err) {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateIncident(id: string, updates: Partial<Incident>) {
    setUpdating(id);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-actions/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Update failed');
      await loadData();
    } catch (err) {
      // fallback: update directly via anon client (works because RLS allows it in this demo)
      try {
        await supabase.from('incidents').update(updates).eq('id', id);
        await loadData();
      } catch {
        // silent fail
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = incidents.filter((i) => {
    const matchesSearch = !search ||
      i.reference_code.toLowerCase().includes(search.toLowerCase()) ||
      i.reporter_name.toLowerCase().includes(search.toLowerCase()) ||
      i.fraud_type.toLowerCase().includes(search.toLowerCase()) ||
      (i.scammer_phone || '').includes(search);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-cyan">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-mono-cyber text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Monitor incidents and global threat trends</p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={<FileWarning className="h-5 w-5" />} label="Total Incidents" value={stats?.total_incidents ?? '—'} color="text-destructive" />
        <AdminStatCard icon={<Activity className="h-5 w-5" />} label="Total Scans" value={stats?.total_scans ?? '—'} color="text-primary" />
        <AdminStatCard icon={<TrendingUp className="h-5 w-5" />} label="Escalated" value={stats?.status_breakdown.escalated ?? 0} color="text-warning" />
        <AdminStatCard icon={<Shield className="h-5 w-5" />} label="Resolved" value={stats?.status_breakdown.resolved ?? 0} color="text-accent" />
      </div>

      <Tabs defaultValue="incidents" className="mt-8">
        <TabsList className="bg-card/60">
          <TabsTrigger value="incidents" className="data-[state=active]:text-primary data-[state=active]:bg-primary/10">Incident Reports</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:text-primary data-[state=active]:bg-primary/10">Threat Trends</TabsTrigger>
        </TabsList>

        {/* Incidents tab */}
        <TabsContent value="incidents">
          {/* Filters */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ref code, name, type, or phone..."
                className="pl-9 bg-background-2/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background-2/40">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_FLOW.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Incident list */}
          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary/40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="mt-4 bg-card/60 p-8 text-center">
              <FileWarning className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No incidents found.</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.map((inc) => (
                <Card key={inc.id} className="bg-card/60 overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-cyber font-bold text-primary">{inc.reference_code}</span>
                        <Badge className={STATUS_COLORS[inc.status]}>{inc.status.replace('_', ' ')}</Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">{inc.fraud_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {inc.reporter_name} · {new Date(inc.created_at).toLocaleString('en-IN')}
                        {inc.amount_lost > 0 && ` · ₹${inc.amount_lost.toLocaleString('en-IN')} lost`}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${expanded === inc.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded details */}
                  {expanded === inc.id && (
                    <div className="border-t border-border/40 p-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Contact: </span>
                          <span className="text-foreground">{inc.reporter_contact}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scammer Phone: </span>
                          <span className="text-foreground">{inc.scammer_phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scammer UPI: </span>
                          <span className="text-foreground font-mono-cyber text-xs">{inc.scammer_upi_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transaction ID: </span>
                          <span className="text-foreground font-mono-cyber text-xs">{inc.transaction_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Incident Date: </span>
                          <span className="text-foreground">{inc.incident_date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount Lost: </span>
                          <span className="text-foreground">₹{inc.amount_lost.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-mono-cyber uppercase tracking-wider text-muted-foreground">Description</p>
                        <p className="mt-1 text-sm text-foreground/90">{inc.description}</p>
                      </div>

                      {/* Admin controls */}
                      <div className="rounded-lg border border-border/40 bg-background-2/40 p-4 space-y-3">
                        <p className="text-xs font-mono-cyber uppercase tracking-wider text-primary">Admin Controls</p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Update Status</Label>
                            <Select
                              value={inc.status}
                              onValueChange={(v) => updateIncident(inc.id, { status: v as Incident['status'] })}
                            >
                              <SelectTrigger className="mt-1 bg-background-2/40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_FLOW.map((s) => (
                                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {updating === inc.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                          <Textarea
                            defaultValue={inc.admin_notes || ''}
                            placeholder="Add internal notes about this incident..."
                            className="mt-1 min-h-[60px] bg-background-2/40 text-sm"
                            onBlur={(e) => {
                              if (e.target.value !== (inc.admin_notes || '')) {
                                updateIncident(inc.id, { admin_notes: e.target.value });
                              }
                            }}
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Flag as Emerging Pattern</Label>
                          <Input
                            defaultValue={inc.threat_pattern || ''}
                            placeholder="e.g. New UPI lookalike variant..."
                            className="mt-1 bg-background-2/40 text-sm"
                            onBlur={(e) => {
                              if (e.target.value !== (inc.threat_pattern || '')) {
                                updateIncident(inc.id, { threat_pattern: e.target.value });
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Emergency */}
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="border-destructive/40 text-destructive">
                          <a href={`tel:${inc.reporter_contact}`} className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Call Reporter</a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary">
                          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> cybercrime.gov.in</a>
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Trends tab */}
        <TabsContent value="trends">
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Status breakdown */}
            <Card className="bg-card/60 p-5">
              <h3 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Incident Status Breakdown</h3>
              {stats && (
                <div className="mt-4 space-y-3">
                  {STATUS_FLOW.map((s) => {
                    const count = stats.status_breakdown[s] || 0;
                    const pct = stats.total_incidents > 0 ? (count / stats.total_incidents) * 100 : 0;
                    return (
                      <div key={s}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-foreground">{s.replace('_', ' ')}</span>
                          <span className="font-mono-cyber text-muted-foreground">{count}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${s === 'resolved' ? 'bg-accent' : s === 'escalated' ? 'bg-destructive' : s === 'under_review' ? 'bg-warning' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Risk breakdown */}
            <Card className="bg-card/60 p-5">
              <h3 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Scan Risk Breakdown</h3>
              {stats && (
                <div className="mt-4 space-y-3">
                  {['safe', 'suspicious', 'dangerous'].map((r) => {
                    const count = stats.risk_breakdown[r] || 0;
                    const pct = stats.total_scans > 0 ? (count / stats.total_scans) * 100 : 0;
                    return (
                      <div key={r}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-foreground">{r}</span>
                          <span className="font-mono-cyber text-muted-foreground">{count}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${r === 'safe' ? 'bg-accent' : r === 'suspicious' ? 'bg-warning' : 'bg-destructive'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Fraud type breakdown */}
            <Card className="bg-card/60 p-5">
              <h3 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Fraud Type Distribution</h3>
              {stats && (
                <div className="mt-4 space-y-2">
                  {Object.entries(stats.fraud_type_breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between rounded-lg bg-background-2/40 px-3 py-2 text-sm">
                        <span className="text-foreground">{type}</span>
                        <Badge variant="outline" className="border-border text-muted-foreground">{count}</Badge>
                      </div>
                    ))}
                  {Object.keys(stats.fraud_type_breakdown).length === 0 && (
                    <p className="text-sm text-muted-foreground">No incidents reported yet.</p>
                  )}
                </div>
              )}
            </Card>

            {/* Emerging patterns */}
            <Card className="bg-card/60 p-5">
              <h3 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Emerging Scam Patterns</h3>
              <div className="mt-4 space-y-2">
                {stats?.patterns.slice(0, 6).map((p) => {
                  const sevMap: Record<string, string> = {
                    critical: 'border-destructive/40 bg-destructive/10 text-destructive',
                    high: 'border-warning/40 bg-warning/10 text-warning',
                    medium: 'border-primary/40 bg-primary/10 text-primary',
                    low: 'border-accent/40 bg-accent/10 text-accent',
                  };
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-background-2/40 px-3 py-2">
                      <div>
                        <p className="text-sm text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.pattern_type} · {p.reported_count.toLocaleString('en-IN')} reports</p>
                      </div>
                      <Badge className={sevMap[p.severity]}>{p.severity}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminStatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <Card className="bg-card/60 p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background-2 ${color}`}>
        {icon}
      </div>
      <p className="mt-4 font-mono-cyber text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </Card>
  );
}