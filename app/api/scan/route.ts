import { NextRequest, NextResponse } from 'next/server';

// LAYER 1: Lexical Analysis
function layer1_lexical(url: string) {
  let score = 0; let reasons: string[] = [];
  if (/\d+\.\d+\.\d+\.\d+/.test(url)) return { score: 100, reasons: ["Raw IP address"] };
  if (url.includes("@")) return { score: 95, reasons: ["Contains @ - Redirection trick"] };
  if ((url.match(/\./g) || []).length >= 4) { score += 35; reasons.push("Many subdomains"); }
  if ((url.match(/-/g) || []).length >= 3) { score += 25; reasons.push("Excessive hyphens"); }
  if (url.length > 75) { score += 20; reasons.push("Long URL"); }
  return { score, reasons };
}

// LAYER 2: Brand Impersonation (SBI, Paytm etc)
function layer2_brand(url: string) {
  const u = url.toLowerCase();
  if (u.includes("sbi") && (u.includes("yono") || u.includes("reward") || u.includes("points"))) 
    return { score: 95, reasons: ["SBI YONO Reward Points Expiry - Emerging Scam Pattern"] };
  if (u.includes("paytm") && u.includes("kyc")) 
    return { score: 92, reasons: ["Paytm KYC Verification Scam"] };
  if (u.includes("electricity") && u.includes("bill")) 
    return { score: 88, reasons: ["Fake Electricity Bill Disconnection"] };
  return { score: 0, reasons: [] };
}

// LAYER 3: Scam Keywords
function layer3_keywords(url: string) {
  let score = 0; let reasons: string[] = [];
  const keywords = ["claim-now", "cashback", "offer", "kyc-update", "secure-kyc", "verify-now", "reward"];
  for (const k of keywords) if (url.toLowerCase().includes(k)) { score += 30; reasons.push(`Scam keyword: ${k}`); }
  return { score, reasons };
}

// LAYER 4: TLD / UPI / WhatsApp Patterns
function layer4_patterns(url: string) {
  let score = 0; let reasons: string[] = [];
  if (url.endsWith(".xyz") || url.endsWith(".tk") || url.includes(".in.net") || url.includes(".claim.login")) {
    score += 40; reasons.push("Suspicious TLD / Domain combo");
  }
  if (url.toLowerCase().includes("upi") && url.includes("-")) { score += 20; reasons.push("Fraudulent UPI Handle Lookalike"); }
  return { score, reasons };
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const l1 = layer1_lexical(url);
  if (l1.score >= 95) return NextResponse.json({ riskScore: l1.score, status: "PHISHING", threat: l1.reasons[0], layers: ["L1"] });

  const l2 = layer2_brand(url);
  if (l2.score >= 90) return NextResponse.json({ riskScore: l2.score, status: "PHISHING", threat: l2.reasons[0], layers: ["L2-Brand"] });

  const l3 = layer3_keywords(url);
  const l4 = layer4_patterns(url);

  const total = Math.min(l1.score + l2.score + l3.score + l4.score, 98);
  const allReasons = [...l1.reasons, ...l2.reasons, ...l3.reasons, ...l4.reasons];

  let status = "Safe";
  if (total >= 85) status = "Phishing";
  else if (total >= 40) status = "Suspicious";

  // LAYER 5: Server-side final scoring
  return NextResponse.json({
    riskScore: total,
    status,
    threat: allReasons.join(" | ") || "Clean",
    layers: ["L1", "L2", "L3", "L4", "L5-Server"],
    emergingMatch: total > 70 ? true : false
  });
}
