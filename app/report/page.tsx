'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileWarning, Send, CheckCircle2, Loader2, Copy, Phone, Globe, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const FRAUD_TYPES = [
  'UPI Fraud',
  'Phishing SMS',
  'Phishing Email',
  'WhatsApp Scam',
  'Fake Call / Vishing',
  'Investment / Crypto Scam',
  'Loan App Fraud',
  'Part-time Job Scam',
  'Fake E-commerce / Delivery',
  'Social Media Impersonation',
  'Other',
];

export default function ReportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ code: string } | null>(null);
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_contact: '',
    fraud_type: '',
    scammer_phone: '',
    scammer_upi_id: '',
    transaction_id: '',
    amount_lost: '',
    description: '',
    incident_date: new Date().toISOString().split('T')[0],
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reporter_name || !form.reporter_contact || !form.fraud_type || !form.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          reporter_name: form.reporter_name,
          reporter_contact: form.reporter_contact,
          fraud_type: form.fraud_type,
          scammer_phone: form.scammer_phone || null,
          scammer_upi_id: form.scammer_upi_id || null,
          transaction_id: form.transaction_id || null,
          amount_lost: form.amount_lost ? parseFloat(form.amount_lost) : 0,
          description: form.description,
          incident_date: form.incident_date,
        })
        .select('reference_code')
        .single();

      if (error) throw error;
      if (data) {
        setSuccess({ code: data.reference_code });
        toast.success('Incident reported successfully!');
      }
    } catch (err) {
      toast.error('Failed to submit report. Please try again or call 1930.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card className="bg-card/60 p-8 text-center glow-emerald">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mt-4 font-mono-cyber text-2xl font-bold text-accent">Report Submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your incident has been recorded. Save your reference code to track the status.
          </p>
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-6">
            <p className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Your Tracking Reference</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono-cyber text-3xl font-bold text-accent">{success.code}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { navigator.clipboard.writeText(success.code); toast.success('Reference code copied'); }}
                className="text-accent hover:bg-accent/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={`/track?ref=${success.code}`}>Track This Incident</a>
            </Button>
            <Button variant="outline" onClick={() => { setSuccess(null); setForm({ reporter_name: '', reporter_contact: '', fraud_type: '', scammer_phone: '', scammer_upi_id: '', transaction_id: '', amount_lost: '', description: '', incident_date: new Date().toISOString().split('T')[0] }); }}>
              Report Another
            </Button>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-border/40 pt-6 text-sm sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="border-destructive/40 text-destructive">
              <a href="tel:1930" className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> Call 1930 Now</a>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary">
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Also report on cybercrime.gov.in</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Toaster />
      <div className="text-center">
        <span className="font-mono-cyber text-xs uppercase tracking-[0.2em] text-destructive">Incident Reporting</span>
        <h1 className="mt-2 font-mono-cyber text-3xl font-bold sm:text-4xl">
          Report a <span className="text-destructive text-glow-red">Cyber Fraud</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Submit details of phishing or fraud attacks. Your report is saved securely and tracked with a reference code.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <ShieldAlert className="h-5 w-5 flex-shrink-0 text-destructive" />
        <p className="text-foreground/90">
          For incidents involving financial loss, also file a complaint at{' '}
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive underline">cybercrime.gov.in</a> and call{' '}
          <a href="tel:1930" className="font-mono-cyber font-bold text-destructive underline">1930</a>. The sooner you act, the better the chances of fund recovery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Card className="bg-card/60 p-6">
          <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-primary">Your Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="reporter_name">Your Name *</Label>
              <Input id="reporter_name" value={form.reporter_name} onChange={(e) => set('reporter_name', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="John Doe" required />
            </div>
            <div>
              <Label htmlFor="reporter_contact">Phone or Email *</Label>
              <Input id="reporter_contact" value={form.reporter_contact} onChange={(e) => set('reporter_contact', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="+91 98765 43210" required />
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 p-6">
          <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-warning">Incident Details</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="fraud_type">Type of Fraud *</Label>
              <Select value={form.fraud_type} onValueChange={(v) => set('fraud_type', v)}>
                <SelectTrigger className="mt-1.5 bg-background-2/40">
                  <SelectValue placeholder="Select fraud type" />
                </SelectTrigger>
                <SelectContent>
                  {FRAUD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="incident_date">Date of Incident *</Label>
              <Input id="incident_date" type="date" value={form.incident_date} onChange={(e) => set('incident_date', e.target.value)} className="mt-1.5 bg-background-2/40" required />
            </div>
            <div>
              <Label htmlFor="description">What Happened? *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} className="mt-1.5 min-h-[120px] bg-background-2/40" placeholder="Describe the incident in detail. How were you contacted, what was asked, what actions did you take?" required />
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 p-6">
          <h2 className="font-mono-cyber text-sm uppercase tracking-wider text-destructive">Scammer & Transaction Info</h2>
          <p className="mt-1 text-xs text-muted-foreground">Provide as much detail as you can. This helps authorities trace the fraud.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="scammer_phone">Scammer Phone / WhatsApp</Label>
              <Input id="scammer_phone" value={form.scammer_phone} onChange={(e) => set('scammer_phone', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="scammer_upi_id">Scammer UPI ID</Label>
              <Input id="scammer_upi_id" value={form.scammer_upi_id} onChange={(e) => set('scammer_upi_id', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="fraudhandle@okaxis" />
            </div>
            <div>
              <Label htmlFor="transaction_id">Transaction / UTR ID</Label>
              <Input id="transaction_id" value={form.transaction_id} onChange={(e) => set('transaction_id', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="401234567890" />
            </div>
            <div>
              <Label htmlFor="amount_lost">Amount Lost (₹)</Label>
              <Input id="amount_lost" type="number" min="0" step="0.01" value={form.amount_lost} onChange={(e) => set('amount_lost', e.target.value)} className="mt-1.5 bg-background-2/40" placeholder="0" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Submit Report</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}