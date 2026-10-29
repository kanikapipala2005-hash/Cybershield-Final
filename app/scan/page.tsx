const res = await fetch('/api/scan',{method:'POST',body:JSON.stringify({url:input}), headers:{'Content-Type':'application/json'}})
const data = await res.json()
setResult(data) // always show, even if save failed text: string }[]> = {
    url: [
      { label: 'SBI YONO Phishing', text: 'https://sbi-yono-rewards-expiry.verify-login.click/claim' },
      { label: 'Paytm KYC Fake', text: 'http://paytm-kyc-update.xyz/verify' },
      { label: 'IP Address Host', text: 'http://192.168.15.23/login.php' },
    ],
    message: [
      { label: 'Electricity Bill SMS', text: 'Dear Customer, your electricity will be disconnected tonight at 9pm due to pending bill payment. Please pay immediately: http://bseb-bill-update.xyz' },
      { label: 'WhatsApp Job Scam', text: 'Hello! We offer part-time work from home. Earn ₹2500 per day by liking YouTube videos. Join our Telegram group @t.me/parttimejobs999. No registration fee!' },
      { label: 'UPI Lookalike', text: 'Send payment to UPI ID: paytm-sbi@okaxis-verify. Amount ₹499 for verification. Refundable.' },
      { label: 'Parcel Scam Call', text: 'This is FedEx Customs. A parcel in your name contains illegal items. Pay ₹25,000 clearance fee to avoid legal action. Call +92 300 1234567 immediately.' },
    ],
    screenshot: [],
  };

  const list = examples[type] || [];
  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Try:</span>
      {list.map((ex) => (
        <button
          key={ex.label}
          onClick={() => onPick(ex.text)}
          className="rounded-full border border-border bg-background-2/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}

function ScanResultCard({ result }: { result: ScanResult }) {
  const level = result.riskLevel;
  const config = {
    safe: { icon: ShieldCheck, color: 'text-accent', bg: 'glow-emerald', border: 'border-accent/40', label: 'Safe', badge: 'border-accent/40 bg-accent/10 text-accent' },
    suspicious: { icon: AlertTriangle, color: 'text-warning', bg: 'glow-warning', border: 'border-warning/40', label: 'Suspicious', badge: 'border-warning/40 bg-warning/10 text-warning' },
    dangerous: { icon: ShieldAlert, color: 'text-destructive', bg: 'glow-red', border: 'border-destructive/40', label: 'Dangerous', badge: 'border-destructive/40 bg-destructive/10 text-destructive' },
  }[level];

  const Icon = config.icon;

  return (
    <Card className={`bg-card/60 p-6 ${config.bg}`}>
      {/* Score header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-background-2 ${config.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono-cyber text-xl font-bold">{config.label}</h3>
              <Badge className={config.badge}>{result.matchedPatterns.length > 0 ? `${result.matchedPatterns.length} pattern(s)` : 'No match'}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Risk Score: <span className={`font-mono-cyber font-bold ${config.color}`}>{result.riskScore}</span>/100
            </p>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>0</span><span>50</span><span>100</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${level === 'safe' ? 'bg-accent' : level === 'suspicious' ? 'bg-warning' : 'bg-destructive'}`}
              style={{ width: `${result.riskScore}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Safe</span><span>Suspicious</span><span>Dangerous</span>
          </div>
        </div>
      </div>

      {/* Threat breakdown */}
      {result.threatFlags.length > 0 && (
        <div className="mt-6">
          <h4 className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Threat Breakdown</h4>
          <div className="mt-3 space-y-2">
            {result.threatFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border/40 bg-background-2/40 p-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-destructive/10 text-xs font-mono-cyber font-bold text-destructive">
                  {flag.weight}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{flag.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{flag.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched patterns */}
      {result.matchedPatterns.length > 0 && (
        <div className="mt-4">
          <h4 className="font-mono-cyber text-xs uppercase tracking-wider text-muted-foreground">Matched Indian Fraud Patterns</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.matchedPatterns.map((p) => (
              <Badge key={p} className="border-destructive/40 bg-destructive/10 text-destructive">{p}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Advice */}
      <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <h4 className="flex items-center gap-2 font-mono-cyber text-xs uppercase tracking-wider text-primary">
          <Lightbulb className="h-4 w-4" /> Actionable Advice
        </h4>
        <ul className="mt-3 space-y-2">
          {result.advice.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency CTA */}
      {(level === 'suspicious' || level === 'dangerous') && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <a href="tel:1930" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Call 1930</a>
          </Button>
          <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Report on cybercrime.gov.in</a>
          </Button>
          <Button asChild variant="ghost" className="text-foreground">
            <a href="/report" className="flex items-center gap-2"><FileWarning className="h-4 w-4" /> File an Incident Report</a>
          </Button>
        </div>
      )}
    </Card>
  );
}
