'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/session';
import { ScamSignature, SCAM_SIGNATURES } from '@/lib/scan-engine';
import { ShieldCheck, ScanLine, AlertTriangle, FileWarning, TrendingUp, ArrowRight, Phone, Globe, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type ScanRow = {
  id: string;
  scan_type: string;
  risk_level: string;
  risk_score: number;
  created_at: string;
  threat_flags: string[];
};

export default function DashboardPage() {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sessionId = getSessionId();
        const [scanRes, incRes] = await Promise.all([
          supabase
            .from('scans')
            .select('id, scan_type, risk_level, risk_score, created_at, threat_flags')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('incidents').select('id', { count: 'exact', head: true }),
        ]);

        if (scanRes.data) setScans(scanRes.data as ScanRow[]);
        if (incRes.count !== null) setIncidentCount(incRes.count);
      } catch (err) {
        // graceful degradation — show zeros
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalScans = scans.length;
  const safeCount = scans.filter((s) => s.risk_level === 'safe').length;
  const suspiciousCount = scans.filter((s) => s.risk_level === 'suspicious').length;
  const dangerousCount = scans.filter((s) => s.risk_level === 'dangerous').length;

  const recentScans = scans.slice(0, 5);
  const topThreats = [...SCAM_SIGNATURES]
    .sort((a, b) => 0)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 grid-bg p-6 sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono-cyber text-xs uppercase tracking-[0.2em] text-accent">System Active</span>
          </div>
          <h1 className="mt-4 font-mono-cyber text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Detect. Report. <span className="text-primary text-glow-cyan">Defend.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Scan suspicious links, SMS, emails, and screenshots for phishing and cyber fraud — tuned for the Indian threat landscape. From SBI YONO reward scams to Paytm KYC fraud and UPI lookalikes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/scan" className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" /> Start a Scan
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <a href="tel:1930" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Call 1930 Helpline
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-foreground hover:bg-secondary">
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> cybercrime.gov.in
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ScanLine className="h-5 w-5" />}
          label="Scans Performed"
          value={loading ? '—' : String(totalScans)}
          color="cyan"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Marked Safe"
          value={loading ? '—' : String(safeCount)}
          color="emerald"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Suspicious / Dangerous"
          value={loading ? '—' : `${suspiciousCount} / ${dangerousCount}`}
          color="warning"
        />
        <StatCard
          icon={<FileWarning className="h-5 w-5" />}
          label="Community Reports"
          value={loading ? '—' : String(incidentCount)}
          color="red"
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Scans */}
        <Card className="bg-card/60 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Recent Scan Activity</h2>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary/40" />
              ))}
            </div>
          ) : recentScans.length === 0 ? (
            <div className="py-12 text-center">
              <ScanLine className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No scans yet. Run your first threat scan to see results here.</p>
              <Button asChild className="mt-4 bg-primary text-primary-foreground">
                <Link href="/scan">Scan Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recentScans.map((s) => (
                <Link
                  key={s.id}
                  href="/scan"
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-background-2/40 p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
                >
                  <RiskDot level={s.risk_level} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">{s.scan_type}</span>
                      <RiskBadge level={s.risk_level} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {s.threat_flags?.length ? `${s.threat_flags.length} threat flag(s)` : 'No flags'} · {new Date(s.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono-cyber text-lg font-bold ${riskColor(s.risk_level)}`}>{s.risk_score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Emerging threats */}
        <Card className="bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Emerging Scam Patterns</h2>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-4 space-y-3">
            {topThreats.map((sig: ScamSignature) => (
              <div key={sig.name} className="rounded-lg border border-border/40 bg-background-2/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{sig.name}</p>
                  <SeverityBadge type={sig.type} weight={sig.weight} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground capitalize">{sig.type} · weight {sig.weight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/scan" icon={<ScanLine className="h-6 w-6" />} title="Scan a Threat" desc="URL, message, or screenshot" color="cyan" />
        <QuickAction href="/report" icon={<FileWarning className="h-6 w-6" />} title="Report an Incident" desc="Submit evidence securely" color="red" />
        <QuickAction href="/track" icon={<Activity className="h-6 w-6" />} title="Track Your Report" desc="Check incident status" color="emerald" />
        <QuickAction href="/learn" icon={<ShieldCheck className="h-6 w-6" />} title="Learn to Protect" desc="Safety guides & modules" color="warning" />
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'cyan' | 'emerald' | 'warning' | 'red' }) {
  const colorMap = {
    cyan: 'text-primary border-primary/30',
    emerald: 'text-accent border-accent/30',
    warning: 'text-warning border-warning/30',
    red: 'text-destructive border-destructive/30',
  };
  return (
    <Card className={`bg-card/60 p-5 border ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background-2 ${colorMap[color].split(' ')[0]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 font-mono-cyber text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </Card>
  );
}

function QuickAction({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: 'cyan' | 'emerald' | 'warning' | 'red' }) {
  const colorMap = {
    cyan: 'text-primary group-hover:text-primary group-hover:border-primary/40',
    emerald: 'text-accent group-hover:text-accent group-hover:border-accent/40',
    warning: 'text-warning group-hover:text-warning group-hover:border-warning/40',
    red: 'text-destructive group-hover:text-destructive group-hover:border-destructive/40',
  };
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-card/60 p-5 transition-all hover:bg-secondary/40 hover:scale-[1.02]">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background-2 ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="mt-4 font-medium text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </Card>
    </Link>
  );
}

function RiskDot({ level }: { level: string }) {
  const colors = { safe: 'bg-accent', suspicious: 'bg-warning', dangerous: 'bg-destructive' };
  return <span className={`h-2.5 w-2.5 rounded-full ${colors[level as keyof typeof colors] || 'bg-muted-foreground'} animate-pulse-ring`} />;
}

function RiskBadge({ level }: { level: string }) {
  const map = {
    safe: <Badge className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20">Safe</Badge>,
    suspicious: <Badge className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20">Suspicious</Badge>,
    dangerous: <Badge className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20">Dangerous</Badge>,
  };
  return map[level as keyof typeof map] || null;
}

function SeverityBadge({ type, weight }: { type: string; weight: number }) {
  const sev = weight >= 28 ? 'critical' : weight >= 24 ? 'high' : 'medium';
  const map = {
    critical: 'border-destructive/40 bg-destructive/10 text-destructive',
    high: 'border-warning/40 bg-warning/10 text-warning',
    medium: 'border-primary/40 bg-primary/10 text-primary',
  };
  return <Badge className={`${map[sev as keyof typeof map]} text-xs`}>{sev}</Badge>;
}

function riskColor(level: string) {
  if (level === 'safe') return 'text-accent';
  if (level === 'suspicious') return 'text-warning';
  return 'text-destructive';
}