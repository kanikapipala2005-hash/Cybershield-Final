'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Shield, Menu, X, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/scan', label: 'Threat Scanner' },
  { href: '/learn', label: 'Education' },
  { href: '/report', label: 'Report Incident' },
  { href: '/track', label: 'Track Status' },
  { href: '/admin', label: 'Admin' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-cyan">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono-cyber text-base font-bold tracking-tight text-foreground">
              Cyber<span className="text-primary text-glow-cyan">Shield</span>
            </span>
            <span className="font-mono-cyber text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Fraud Guard · India
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 font-mono-cyber text-xs uppercase tracking-wider transition-colors',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
            <a href="tel:1930" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              1930
            </a>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Report
            </a>
          </Button>
        </div>

        <button
          className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 font-mono-cyber text-sm uppercase tracking-wider transition-colors',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1 border-accent/40 text-accent">
                <a href="tel:1930" className="flex items-center justify-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> 1930
                </a>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground">
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Report
                </a>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}