'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Eye, KeyRound, Smartphone, Mail, CreditCard, Users, AlertTriangle, Phone, Globe, BookOpen, GraduationCap, FileWarning } from 'lucide-react';
import Link from 'next/link';

type ScamPattern = {
  id: string;
  name: string;
  description: string;
  pattern_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_count: number;
};

const MODULES = [
  {
    id: 'safe-browsing',
    icon: Globe,
    title: 'Safe Browsing Fundamentals',
    color: 'text-primary',
    lessons: [
      { q: 'How do I recognize a phishing website?', a: 'Check the URL for misspellings (e.g. sbi-bank-login.com vs sbi.co.in), look for HTTPS padlock (but note: phishing sites also use HTTPS now), and avoid clicking links directly from emails or SMS. Always type the website address yourself.' },
      { q: 'What is a link shortener and why is it risky?', a: 'Services like bit.ly or tinyurl shorten long URLs, but they hide the real destination. Scammers use them to mask phishing pages. Use a link expander tool or hover on desktop to preview the destination before clicking.' },
      { q: 'Should I trust a website just because it has a padlock (HTTPS)?', a: 'No. The padlock only means the connection is encrypted, not that the site is legitimate. Many phishing sites now have free SSL certificates. Always verify the exact domain name.' },
    ],
  },
  {
    id: 'password-hygiene',
    icon: KeyRound,
    title: 'Password Hygiene',
    color: 'text-accent',
    lessons: [
      { q: 'What makes a strong password?', a: 'Use at least 12 characters mixing uppercase, lowercase, numbers, and symbols. Avoid personal info like birth dates, names, or phone numbers. Use a unique password for every account. A passphrase (e.g. "Blue-Elephant-Jumps-42!") is both strong and memorable.' },
      { q: 'Should I use a password manager?', a: 'Yes. Password managers like Bitwarden, 1Password, or your browser\'s built-in manager generate and store strong passwords so you only remember one master password. Never reuse the same password across banking and social media.' },
      { q: 'What is two-factor authentication (2FA)?', a: '2FA adds a second verification step beyond your password — usually an OTP from an app (like Google Authenticator) or SMS. Enable 2FA on all banking, email, and social accounts. App-based 2FA is more secure than SMS.' },
    ],
  },
  {
    id: 'social-engineering',
    icon: Users,
    title: 'Recognizing Social Engineering',
    color: 'text-warning',
    lessons: [
      { q: 'What is social engineering?', a: 'Social engineering manipulates people into revealing sensitive info or transferring money. Common tactics: creating urgency, impersonating authority figures (police, bank officials), pretending to be a friend in distress, or offering rewards. The key defense is to pause and verify independently.' },
      { q: 'How do I spot a fake customer care number?', a: 'Scammers post fake customer care numbers on social media or fake websites. Always find official numbers on the back of your card, the official app, or the verified website. Never call numbers from Google search results without cross-checking.' },
      { q: 'What is a "remote access" scam?', a: 'A caller claiming to be from a bank, telecom, or tech support asks you to install apps like AnyDesk, TeamViewer, or ScreenShare. These give them full access to your phone. Never install remote access apps at someone\'s request. Banks never ask for this.' },
    ],
  },
  {
    id: 'upi-fraud',
    icon: Smartphone,
    title: 'UPI & Payment Fraud',
    color: 'text-destructive',
    lessons: [
      { q: 'How do UPI lookalike scams work?', a: 'Fraudsters create UPI handles that look similar to legitimate ones (e.g. @paytm-sbi instead of @paytm, or @okaxis-verify instead of @okaxis). Always verify the recipient name displayed before confirming payment. Check for extra words like "verify", "support", or numbers.' },
      { q: 'What should I never share for UPI?', a: 'Never share your UPI PIN, OTP, or approve a "collect request" from an unknown person. UPI never asks you to "receive money" by entering your PIN. If someone sends a collect request, deny it.' },
      { q: 'What is a "screen share" UPI scam?', a: 'Scammers ask you to share your screen while you make a payment, then capture your UPI PIN or OTP. Never share your screen during any payment or banking activity.' },
    ],
  },
  {
    id: 'otp-awareness',
    icon: Mail,
    title: 'OTP & Credential Protection',
    color: 'text-primary',
    lessons: [
      { q: 'Will my bank ever ask for my OTP?', a: 'Never. No bank, government agency, or legitimate service will ever ask you to share your OTP, PIN, CVV, or password — not by phone, SMS, email, or WhatsApp. If anyone asks, it is a scam. End the conversation immediately.' },
      { q: 'What do I do if I accidentally shared an OTP?', a: 'Call your bank immediately (use the number on the back of your card) and ask them to block the transaction and freeze the account. Then report to 1930 and cybercrime.gov.in. Speed is critical — funds can be recalled if reported within the golden hour.' },
      { q: 'Is it safe to read out an OTP for a "verification"?', a: 'No. An OTP is a one-time password meant for you only. No verification process requires you to read it out. If someone asks you to read an OTP for any reason, it is a scam.' },
    ],
  },
  {
    id: 'credit-card',
    icon: CreditCard,
    title: 'Credit & Debit Card Safety',
    color: 'text-accent',
    lessons: [
      { q: 'How do I protect my card details online?', a: 'Never enter card details on websites reached via SMS or email links. Use virtual cards or UPI for online payments when possible. Enable transaction alerts and set daily limits. Never save card details on shared or public computers.' },
      { q: 'What is card skimming?', a: 'Skimmers are hidden devices on ATMs and POS machines that copy your card data. Always inspect the card slot and PIN pad for anything unusual. Cover the PIN pad with your other hand while entering your PIN.' },
      { q: 'Should I respond to "card upgrade" or "reward expiry" calls?', a: 'No. These are common scams. For card upgrades, visit your bank branch or use the official app. Never share card number, CVV, expiry, or OTP over a phone call.' },
    ],
  },
];

export default function LearnPage() {
  const [patterns, setPatterns] = useState<ScamPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('scam_patterns')
          .select('id, name, description, pattern_type, severity, reported_count')
          .eq('is_active', true)
          .order('reported_count', { ascending: false });
        if (data) setPatterns(data as ScamPattern[]);
      } catch {
        // graceful
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <span className="font-mono-cyber text-xs uppercase tracking-[0.2em] text-accent">Cyber Education Hub</span>
        <h1 className="mt-2 font-mono-cyber text-3xl font-bold sm:text-4xl">
          Learn to <span className="text-accent text-glow-emerald">Protect Yourself</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Interactive safety modules and guides on recognizing modern social engineering, safe browsing, and fraud prevention.
        </p>
      </div>

      {/* Emergency banner */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-foreground">
          <span className="font-medium">In an emergency?</span> Call the National Cyber Crime Helpline{' '}
          <a href="tel:1930" className="font-mono-cyber font-bold text-destructive underline">1930</a> or report at{' '}
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="font-mono-cyber font-bold text-destructive underline">cybercrime.gov.in</a>
        </p>
      </div>

      {/* Safety modules */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-mono-cyber text-lg font-bold">
          <GraduationCap className="h-5 w-5 text-primary" /> Interactive Safety Modules
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.id} className="bg-card/60 p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background-2 ${mod.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-foreground">{mod.title}</h3>
                </div>
                <Accordion type="single" collapsible className="mt-4">
                  {mod.lessons.map((lesson, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
                      <AccordionTrigger className="text-left text-sm text-foreground hover:no-underline">
                        {lesson.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                        {lesson.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Scam pattern catalog */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-mono-cyber text-lg font-bold">
            <BookOpen className="h-5 w-5 text-warning" /> Known Indian Scam Patterns
          </h2>
          <Button asChild variant="ghost" className="text-foreground">
            <Link href="/scan">Run a Scan <AlertTriangle className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        {loading ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary/40" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {patterns.map((p) => {
              const sevMap = {
                critical: 'border-destructive/40 bg-destructive/10 text-destructive',
                high: 'border-warning/40 bg-warning/10 text-warning',
                medium: 'border-primary/40 bg-primary/10 text-primary',
                low: 'border-accent/40 bg-accent/10 text-accent',
              };
              return (
                <Card key={p.id} className="bg-card/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{p.name}</h3>
                        <Badge className={sevMap[p.severity]}>{p.severity}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                      <p className="mt-2 font-mono-cyber text-xs text-muted-foreground">
                        {p.reported_count.toLocaleString('en-IN')} reports · {p.pattern_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick tips */}
      <section className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <h2 className="flex items-center gap-2 font-mono-cyber text-lg font-bold text-accent">
          <ShieldCheck className="h-5 w-5" /> Golden Rules of Cyber Safety
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Never share OTP, UPI PIN, CVV, or passwords — with anyone, ever.',
            'Banks never call to ask for KYC details or card information.',
            'Verify URLs character-by-character before entering credentials.',
            'Do not click links in unsolicited SMS, WhatsApp, or emails.',
            'Never install remote access apps (AnyDesk, TeamViewer) at someone\'s request.',
            'If scammed, call 1930 immediately — the "golden hour" matters.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-background-2/40 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <p className="text-sm text-foreground/90">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}