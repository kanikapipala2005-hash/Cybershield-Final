'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, FileWarning, Phone, Globe, CheckCircle2, Clock, ArrowUpCircle, ShieldCheck } from 'lucide-react';

type Incident = {
  id: string;
  reference_code: string;
  fraud_type: string;
  status: 'submitted' | 'under_review' | 'escalated' | 'resolved';
  description: string;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  reporter_name: string;
};

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: FileWarning, desc: 'Your report has been received and logged.' },
  { key: 'under_review', label: 'Under Review', icon: Clock, desc: 'Our team is reviewing your report.' },
  { key: 'escalated', label: 'Escalated to Authorities', icon: ArrowUpCircle, desc: 'Your case has been forwarded to cyber crime authorities.' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, desc: 'Your case has been resolved or closed.' },
];

const STATUS_COLORS: Record<string, string> = {
  submitted: 'border-primary/40 bg-primary/10 text-primary',
  under_review: 'border-warning/40 bg-warning/10 text-warning',
  escalated: 'border-destructive/40 bg-destructive/10 text-destructive',
  resolved: 'border-accent/40 bg-accent/10 text-accent',
};

function TrackContent() {
  const params = useSearchParams();
  const initialRef = params.get('ref') || '';
  const [refCode, setRefCode] = useState(initialRef);
  const [searching, setSearching] = useState(false);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(code?: string) {
    const search = (code || refCode).trim().toUpperCase();
    if (!search) return;
    setSearching(true);
    setError(null);
    setIncident(null);
    setSearched(false);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('id, reference_code, fraud_type, status, description, created_at, updated_at, admin_notes, reporter_name')
        .eq('reference_code', search)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setIncident(data as Incident);
      } else {
        setError('No incident found with that reference code. Double-check the code and try again.');
      }
    } catch (err) {
      setError('Could not search. Please check your connection and try again.');
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  const currentIndex = incident ? STATUS_STEPS.findIndex((s) => s.key === incident.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="font-mono-cyber text-xs uppercase tracking-[0.2em] text-accent">Status Tracker</span>
        <h1 className="mt-2 font-mono-cyber text-3xl font-bold sm:text-4xl">
          Track Your <span className="text-accent text-glow-emerald">Incident</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your reference code to check the progress of your reported incident.
        </p>
      </div>

      {/* Search */}
      <Card className="mt-8 bg-card/60 p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={refCode}
            onChange={(e) => setRefCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter reference code (e.g. A1B2C3D4)"
            className="font-mono-cyber bg-background-2/40 uppercase"
          />
          <Button onClick={() => handleSearch()} disabled={searching} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Track</span>
          </Button>
        </div>
        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </Card>

      {/* Result */}
      {incident && (
        <div className="mt-6 space-y-5">
          {/* Summary */}
          <Card className="bg-card/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Reference</p>
                <p className="font-mono-cyber text-2xl font-bold text-primary">{incident.reference_code}</p>
              </div>
              <Badge className={STATUS_COLORS[incident.status]}>{incident.status.replace('_', ' ')}</Badge>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Fraud Type: </span>
                <span className="font-medium text-foreground">{incident.fraud_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Reported by: </span>
                <span className="font-medium text-foreground">{incident.reporter_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Filed on: </span>
                <span className="font-medium text-foreground">{new Date(incident.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last updated: </span>
                <span className="font-medium text-foreground">{new Date(incident.updated_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            {incident.admin_notes && (
              <div className="mt-4 rounded-lg border border-border/40 bg-background-2/40 p-3">
                <p className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Admin Notes</p>
                <p className="mt-1 text-sm text-foreground/90">{incident.admin_notes}</p>
              </div>
            )}
          </Card>

          {/* Progress tracker */}
          <Card className="bg-card/60 p-6">
            <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-foreground">Progress Timeline</h2>
            <div className="mt-5 space-y-1">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        done
                          ? step.key === 'resolved'
                            ? 'border-accent bg-accent/20 text-accent'
                            : step.key === 'escalated'
                            ? 'border-destructive bg-destructive/20 text-destructive'
                            : step.key === 'under_review'
                            ? 'border-warning bg-warning/20 text-warning'
                            : 'border-primary bg-primary/20 text-primary'
                          : 'border-border bg-background-2/40 text-muted-foreground'
                      } ${active ? 'animate-pulse-ring' : ''}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-12 w-0.5 ${i < currentIndex ? 'bg-accent' : 'bg-border/40'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</h3>
                        {done && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                      {active && incident.updated_at && (
                        <p className="mt-1 font-mono-cyber text-[10px] text-muted-foreground">
                          Updated: {new Date(incident.updated_at).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Emergency */}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-destructive/40 text-destructive">
              <a href="tel:1930" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Call 1930</a>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary">
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2"><Globe className="h-4 w-4" /> cybercrime.gov.in</a>
            </Button>
          </div>
        </div>
      )}

      {searched && !incident && !error && (
        <Card className="mt-6 bg-card/60 p-8 text-center">
          <FileWarning className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No incident found with that reference code.</p>
        </Card>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <TrackContent />
    </Suspense>
  );
}