'use client';

import Link from 'next/link';
import { Shield, Phone, Globe, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background-2/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-cyan">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-mono-cyber text-base font-bold">
                Cyber<span className="text-primary text-glow-cyan">Shield</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              A phishing and cyber fraud detection tool built for India. Scan, report, and stay protected.
            </p>
          </div>

          <div>
            <h4 className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Tools</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/scan" className="text-foreground/80 hover:text-primary">Threat Scanner</Link></li>
              <li><Link href="/learn" className="text-foreground/80 hover:text-primary">Education Hub</Link></li>
              <li><Link href="/report" className="text-foreground/80 hover:text-primary">Report Incident</Link></li>
              <li><Link href="/track" className="text-foreground/80 hover:text-primary">Track Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Emergency</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="tel:1930" className="flex items-center gap-2 text-foreground/80 hover:text-accent">
                  <Phone className="h-4 w-4" /> Helpline 1930
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
                  <Globe className="h-4 w-4" /> cybercrime.gov.in
                </a>
              </li>
              <li>
                <a href="mailto:cybercell@nchr.gov.in" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
                  <Mail className="h-4 w-4" /> Cyber Cell
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Disclaimer</h4>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              CyberShield provides heuristic risk assessment for educational purposes. It is not a substitute for official law enforcement. For incidents involving financial loss, always contact 1930 and cybercrime.gov.in.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <p className="font-mono-cyber text-xs text-muted-foreground">
            © {new Date().getFullYear()} CyberShield · Stay Vigilant · Stay Safe
          </p>
        </div>
      </div>
    </footer>
  );
}