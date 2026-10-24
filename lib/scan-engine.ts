export type RiskLevel = 'safe' | 'suspicious' | 'dangerous';

export type ScanType = 'url' | 'message' | 'screenshot';

export interface ThreatFlag {
  label: string;
  detail: string;
  weight: number;
}

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  threatFlags: ThreatFlag[];
  advice: string[];
  matchedPatterns: string[];
}

export function categorize(score: number): RiskLevel {
  if (score <= 30) return 'safe';
  if (score <= 70) return 'suspicious';
  return 'dangerous';
}

// =========================================================
// Indian-context scam signature database
// =========================================================
export interface ScamSignature {
  name: string;
  type: 'sms' | 'whatsapp' | 'upi' | 'url' | 'call';
  keywords: RegExp[];
  weight: number;
  advice: string[];
}

export const SCAM_SIGNATURES: ScamSignature[] = [
  {
    name: 'SBI YONO Reward Points Expiry',
    type: 'sms',
    keywords: [/yono/i, /sbi/i, /reward\s*points?\s*(expir|end)/i, /redeem\s+now/i],
    weight: 28,
    advice: [
      'SBI never asks you to redeem reward points via SMS links. Check rewards only inside the official YONO SBI app.',
      'Never share your SBI account number, debit card details, or OTP with anyone.',
    ],
  },
  {
    name: 'Paytm KYC Verification Scam',
    type: 'sms',
    keywords: [/paytm/i, /kyc/i, /(suspend|close|block).*(account|wallet)/i, /verify.{0,20}kyc/i],
    weight: 30,
    advice: [
      'Paytm KYC is free and only done through the official Paytm app. No agent will call you for KYC.',
      'Never share OTP, UPI PIN, or Paytm password. Paytm never asks for these.',
    ],
  },
  {
    name: 'Fake Electricity Bill Disconnection',
    type: 'sms',
    keywords: [/electricity/i, /(disconnect|cut\s*off)/i, /bill/i, /biller?\s*(update|pending)/i, /(today|immediate).{0,20}payment/i],
    weight: 26,
    advice: [
      'Disconnection notices come from your power board via official channels, not random SMS links.',
      'Pay electricity bills only through official board websites (e.g. bsesdelhi.com, mahadiscom.in) or apps like Bharat BillPay.',
    ],
  },
  {
    name: 'WhatsApp Part-Time Job Scam',
    type: 'whatsapp',
    keywords: [/part[\s-]?time/i, /(earn|salary).{0,20}(₹|rs\.?|rupees)\s*[\d,]+/i, /work\s*from\s*home/i, /(telegram|whatsapp).{0,30}(task|job)/i, /like.{0,10}videos?\s*(and|&)\s*(earn|get\s*paid)/i, /prepaid\s+task/i],
    weight: 27,
    advice: [
      'High-paying part-time work that asks you to pay an upfront fee or complete prepaid tasks on Telegram is a scam.',
      'Never pay registration fees or complete prepaid tasks to withdraw earnings.',
    ],
  },
  {
    name: 'Fraudulent UPI Handle Lookalike',
    type: 'upi',
    keywords: [/@(paytm|okaxis|ybl|oksbi|okhdfcbank|paytm-sbi|okaxis-verify|paytm-?verify)[-.]?/i, /@.*-\d+/i, /upi\s+id/i, /send\s+(money|payment)\s+to/i],
    weight: 24,
    advice: [
      'Always verify the UPI recipient name matches the intended person before confirming payment.',
      'Fraudsters use lookalike handles like @paytm-sbi or @okaxis-verify. Legitimate handles do not contain "verify" or "support".',
    ],
  },
  {
    name: 'OTP / UPI PIN Harvesting',
    type: 'sms',
    keywords: [/\b(otp|cvv|pin|password)\b/i, /share.{0,20}(otp|cvv|pin)/i, /do\s*not\s*share/i, /verify.{0,30}otp/i],
    weight: 22,
    advice: [
      'Never share OTP, UPI PIN, CVV, or passwords with anyone, not even bank officials. Banks never ask for these.',
      'If you have shared an OTP, immediately block your card/UPI by calling your bank.',
    ],
  },
  {
    name: 'Fake Lottery / Prize Win',
    type: 'sms',
    keywords: [/lottery/i, /(won|winner|congratulations).{0,30}(prize|reward|cash|₹|rs\.?)/i, /claim.{0,15}(prize|reward|cash)/i, /kbc|kaun\s*banega\s*crorepati/i],
    weight: 29,
    advice: [
      'You did not win a lottery you never entered. No real prize requires a processing fee.',
      'Block and report the sender. Do not call the provided number.',
    ],
  },
  {
    name: 'Fake Customs / Parcel Scam',
    type: 'call',
    keywords: [/customs/i, /parcel/i, /(illegal|contraband|narcotics).{0,20}(parcel|package|shipment)/i, /clear.{0,10}customs/i, /fedex|dhl|courier/i],
    weight: 28,
    advice: [
      'Indian Customs never calls individuals demanding payment to clear a parcel. This is a common scam targeting NRIs and citizens.',
      'Do not transfer money. Report to 1930 or cybercrime.gov.in immediately.',
    ],
  },
  {
    name: 'Indian Railway / IRCTC Lottery',
    type: 'sms',
    keywords: [/irctc/i, /railway/i, /(free|win|prize).{0,20}(ticket|travel)/i, /pn[\s-]?r\s*number/i],
    weight: 22,
    advice: [
      'IRCTC does not run ticket lotteries. Book tickets only on irctc.co.in or the official IRCTC Rail Connect app.',
    ],
  },
  {
    name: 'Cryptocurrency / Investment Scheme',
    type: 'whatsapp',
    keywords: [/(bitcoin|crypto|trading|forex|investment)\s*(scheme|plan|group|signal)/i, /guaranteed.{0,15}(returns|profit)/i, /double.{0,10}(your|the)\s+(money|investment)/i, /whatsapp.{0,20}(investment|trading)\s+group/i],
    weight: 26,
    advice: [
      'Guaranteed crypto returns are always scams. SEBI regulates investments; unregistered schemes are illegal.',
      'Never join investment groups via unknown WhatsApp numbers.',
    ],
  },
  {
    name: 'Loan App Fraud',
    type: 'sms',
    keywords: [/instant\s+loan/i, /loan.{0,15}(approved|sanctioned|pre-?approved)/i, /download.{0,20}(loan|credit)\s+app/i, /zero.{0,10}documentation/i],
    weight: 25,
    advice: [
      'Only borrow from RBI-registered NBFCs and banks. Unauthorized loan apps steal contacts and harass borrowers.',
      'Never grant camera, contacts, or SMS permissions to loan apps.',
    ],
  },
];

// =========================================================
// URL heuristic patterns
// =========================================================
const SUSPICIOUS_TLD = /\.(zip|click|top|xyz|rest|quest|country|kim|cricket|science|work|men|party|review|stream|tk|gq|ml|cf|ga)$/i;
const SHORTENERS = /(bit\.ly|tinyurl|t\.co|goo\.gl|shorte\.st|cutt\.ly|is\.gd|buff\.ly|rebrand\.ly|rb\.gy|tiny\.cc|shorturl\.at|ow\.ly|tiny\.cc)/i;
const IP_AS_HOST = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}/i;
const MANY_SUBDOMAINS = /([a-z0-9-]+\.){4,}[a-z]{2,}/i;
const BRAND_IMPERSONATION = /(sbionline|sbilife|sbicard|hdfcbank-|icicibank-|axisbank-|paytm-|paytmverify|amazon-?in|flipkart-?verify|swiggy-?offer|zomato-?offer|airtel-?reward|jio-?reward|phonepe-?verify|gpay-?verify)/i;
const FREE_HOSTING = /(weebly|wixsite|wordpress|blogspot|godaddysites|sites\.google|glitch\.me|netlify\.app|vercel\.app|github\.io|replit\.app)/i;
const REDIRECT_HINT = /(redirect|redir|url=|goto|next=|return=|continue=)/i;
const CREDENTIAL_HARVEST = /(login|signin|account|verify|update|secure|unlock|confirm|wallet|recover)[\w.-]*\./i;

// =========================================================
// Generic fraud cues (apply to any text)
// =========================================================
const URGENCY_CUES = [
  /(urgent|immediately|right\s+now|asap|expires?\s+(today|in\s+\d+\s+(hour|min)|soon)|last\s+(chance|warning|notice)|final\s+notice)/i,
  /(your\s+(account|card|number|service)\s+(will\s+be|is\s+about\s+to\s+be)\s+(blocked|suspended|closed|deactivated))/i,
  /(act\s+now|don'?t\s+(wait|delay|ignore))/i,
];
const MONEY_CUES = [
  /₹\s*[\d,]+|rs\.?\s*[\d,]+|rupees?\s*[\d,]+/i,
  /(pay|deposit|transfer|send).{0,20}(₹|rs\.?|rupees)\s*[\d,]+/i,
  /processing\s+fee|registration\s+fee|clearance\s+fee|refundable\s+fee/i,
];
const LINK_CUES = [
  /(https?:\/\/|www\.)/i,
  /bit\.ly|tinyurl|t\.co|cutt\.ly/i,
  /tap\s+(here|now|to)|click\s+(here|now|below|this\s+link)|visit\s+(here|now)/i,
];
const SPOOF_CUES = [
  /(dear\s+(customer|user|sir|madam|sir\/madam))/i,
  /(your\s+(bank|bank\s+of\s+(india|baroda)|sbi|hdfc|icici|axis|kotak))/i,
  /(customer\s+care|helpline|toll[\s-]?free|support\s+team)/i,
];

// =========================================================
// Main scan functions
// =========================================================

export function scanUrl(input: string): ScanResult {
  const flags: ThreatFlag[] = [];
  const advice: string[] = [];
  const matched: string[] = [];
  let score = 0;

  const url = input.trim();
  if (!url) {
    return { riskScore: 0, riskLevel: 'safe', threatFlags: [], advice: [], matchedPatterns: [] };
  }

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = parsed.hostname;

    if (SUSPICIOUS_TLD.test(host)) {
      flags.push({ label: 'Suspicious TLD', detail: `${host} uses a top-level domain frequently abused for phishing (.${host.split('.').pop()}).`, weight: 18 });
      score += 18;
    }
    if (SHORTENERS.test(host)) {
      flags.push({ label: 'Link Shortener', detail: 'Shortened URLs hide the real destination and are commonly used to mask phishing sites.', weight: 12 });
      score += 12;
    }
    if (IP_AS_HOST.test(url)) {
      flags.push({ label: 'Raw IP Address', detail: 'Legitimate services use domain names, not raw IP addresses. This is a strong phishing signal.', weight: 22 });
      score += 22;
    }
    if (MANY_SUBDOMAINS.test(host)) {
      flags.push({ label: 'Excessive Subdomains', detail: 'Too many subdomain levels are used to mimic trusted brands (e.g. bank-login.secure.verify.example.com).', weight: 14 });
      score += 14;
    }
    if (BRAND_IMPERSONATION.test(host)) {
      flags.push({ label: 'Brand Impersonation', detail: 'The domain mimics a known Indian brand with added words like "verify", "secure", or "offer".', weight: 24 });
      score += 24;
      matched.push('Brand impersonation detected');
      advice.push('Do not enter login or payment details. Visit the official brand website directly by typing the known URL.');
    }
    if (FREE_HOSTING.test(host)) {
      flags.push({ label: 'Free Hosting Domain', detail: 'Page hosted on a free website builder frequently abused to spin up phishing pages.', weight: 16 });
      score += 16;
    }
    if (REDIRECT_HINT.test(parsed.search) || REDIRECT_HINT.test(parsed.pathname)) {
      flags.push({ label: 'Open Redirect Parameter', detail: 'URL contains redirect parameters that can bounce visitors to a malicious destination.', weight: 15 });
      score += 15;
    }
    if (parsed.protocol === 'http:') {
      flags.push({ label: 'Insecure HTTP', detail: 'The link uses HTTP instead of HTTPS. Banks and payment services always use HTTPS.', weight: 8 });
      score += 8;
    }
    if (CREDENTIAL_HARVEST.test(host)) {
      flags.push({ label: 'Credential Harvest Keywords', detail: 'Domain contains keywords like "login", "verify", or "unlock" combined with an unfamiliar name.', weight: 12 });
      score += 12;
    }
    if (/@/.test(parsed.pathname) || /%40/.test(parsed.href)) {
      flags.push({ label: 'Embedded @ in URL', detail: 'The @ symbol in a URL can hide the true destination. This is a classic deception trick.', weight: 18 });
      score += 18;
    }
  } catch {
    flags.push({ label: 'Malformed URL', detail: 'The input is not a valid URL. It may be an attempt to disguise a malicious link.', weight: 20 });
    score += 20;
  }

  // Cross-check against scam signatures for URL type
  for (const sig of SCAM_SIGNATURES) {
    if (sig.type === 'url' || sig.type === 'upi') {
      const hits = sig.keywords.filter((k) => k.test(url));
      if (hits.length >= 1) {
        flags.push({ label: sig.name, detail: `Matched known Indian fraud pattern: ${sig.name}.`, weight: sig.weight });
        score += sig.weight;
        matched.push(sig.name);
        advice.push(...sig.advice);
      }
    }
  }

  score = Math.min(100, score);
  if (advice.length === 0) {
    if (score <= 30) advice.push('No strong threats detected, but always verify links before sharing personal or financial information.');
    else advice.push('Do not click this link. If you already did, do not enter any credentials and report at cybercrime.gov.in or call 1930.');
  }
  advice.push('When in doubt, open the official website directly by typing its address instead of clicking links in messages.');

  return { riskScore: score, riskLevel: categorize(score), threatFlags: flags, advice, matchedPatterns: matched };
}

export function scanMessage(input: string): ScanResult {
  const flags: ThreatFlag[] = [];
  const advice: string[] = [];
  const matched: string[] = [];
  let score = 0;
  const text = input.trim();

  if (!text) {
    return { riskScore: 0, riskLevel: 'safe', threatFlags: [], advice: [], matchedPatterns: [] };
  }

  // Urgency
  for (const cue of URGENCY_CUES) {
    if (cue.test(text)) {
      flags.push({ label: 'Fake Urgency', detail: 'Message pressures you to act immediately — a hallmark of social engineering.', weight: 15 });
      score += 15;
      advice.push('Pause and verify independently. Scammers manufacture urgency so you act before thinking.');
      break;
    }
  }
  // Money / fees
  for (const cue of MONEY_CUES) {
    if (cue.test(text)) {
      flags.push({ label: 'Requests for Money', detail: 'Message asks for payment, fees, or transfers. Legitimate institutions do not ask for fees via SMS/WhatsApp.', weight: 14 });
      score += 14;
      advice.push('Never pay a fee to claim a prize, clear a parcel, or unlock an account. Real refunds go to your original payment method.');
      break;
    }
  }
  // Links
  let linkFound = false;
  for (const cue of LINK_CUES) {
    if (cue.test(text)) {
      flags.push({ label: 'Misleading Link', detail: 'Message contains a link. In fraud SMS, links lead to phishing pages or malware.', weight: 16 });
      score += 16;
      linkFound = true;
      advice.push('Do not click links in unsolicited messages. Type the official website address yourself.');
      break;
    }
  }
  // Spoofed sender cues
  for (const cue of SPOOF_CUES) {
    if (cue.test(text)) {
      flags.push({ label: 'Spoofed Sender Language', detail: 'Generic greetings like "Dear Customer" and claims to be from your bank are common in spoofed SMS.', weight: 12 });
      score += 12;
      advice.push('Banks address you by name. Verify by calling the official number on the back of your card, never a number from the message.');
      break;
    }
  }

  // Scam signatures
  for (const sig of SCAM_SIGNATURES) {
    const hits = sig.keywords.filter((k) => k.test(text));
    if (hits.length >= 1) {
      flags.push({ label: sig.name, detail: `Matched known Indian fraud pattern: ${sig.name}. ${hits.length} signal(s) detected.`, weight: sig.weight });
      score += sig.weight;
      matched.push(sig.name);
      advice.push(...sig.advice);
    }
  }

  // OTP / sensitive info requests
  if (/\b(otp|cvv|pin|password|otp\s*number)\b/i.test(text) && /share|send|provide|enter|type/i.test(text)) {
    flags.push({ label: 'Requests Sensitive Info', detail: 'Message asks you to share OTP, PIN, CVV, or password — no legitimate entity ever does this.', weight: 20 });
    score += 20;
    advice.push('Never share OTP, PIN, CVV, or passwords with anyone. If you already did, call your bank immediately to block access.');
  }

  // Mixed scripts / lookalike characters
  if (/[\u0900-\u097F]/.test(text) && /https?|www|₹|rs/i.test(text)) {
    flags.push({ label: 'Devanagari + Latin Mixed', detail: 'Mixing Hindi/Devanagari text with links and money amounts is common in regional-language phishing.', weight: 8 });
    score += 8;
  }

  score = Math.min(100, score);
  if (advice.length === 0) {
    advice.push('No strong fraud signals detected. Stay cautious and never share OTP, PIN, or passwords.');
  }
  if (linkFound) advice.push('If you must check a link, hover it on desktop first — mobile hides the real destination.');

  return { riskScore: score, riskLevel: categorize(score), threatFlags: flags, advice, matchedPatterns: matched };
}

export function scanScreenshot(input: string): ScanResult {
  // In a production app this would run OCR; here we analyze any extracted/pasted text.
  // If text is empty, we simulate a light heuristic on the filename.
  const text = (input || '').trim();
  if (text) return scanMessage(text);
  return {
    riskScore: 25,
    riskLevel: 'suspicious',
    threatFlags: [{ label: 'Unable to Extract Text', detail: 'No readable text was extracted from the screenshot. Treat any unsolicited payment or KYC screen as suspicious by default.', weight: 25 }],
    advice: [
      'If the screenshot asks you to pay, share OTP, or complete KYC, treat it as suspicious.',
      'Compare any UPI handle character-by-character with the official one. Fraudsters swap letters (e.g. l for I, 0 for O).',
    ],
    matchedPatterns: [],
  };
}

export function scan(scanType: ScanType, input: string): ScanResult {
  switch (scanType) {
    case 'url':
      return scanUrl(input);
    case 'message':
      return scanMessage(input);
    case 'screenshot':
      return scanScreenshot(input);
    default:
      return { riskScore: 0, riskLevel: 'safe', threatFlags: [], advice: [], matchedPatterns: [] };
  }
}
