import { NextRequest, NextResponse } from 'next/server'

function checkUrl(url: string) {
  let score = 0
  const list: any[] = []
  const l = url.toLowerCase()
  if (/\d+\.\d+\.\d+\.\d+/.test(url)) {
    score += 45; list.push({ label: "Raw IP Host", score: 45, desc: "Uses IP address" })
  }
  if (l.includes("sbi") && (l.includes("yono") || l.includes("reward") || l.includes("verify"))) {
    score += 40; list.push({ label: "SBI YONO Scam Pattern", score: 40, desc: "Matches active India scam" })
  }
  if (l.includes("paytm") && l.includes("kyc")) {
    score += 35; list.push({ label: "Paytm KYC Scam", score: 35, desc: "Fake KYC block" })
  }
  if (l.includes(".click") || l.includes(".xyz")) {
    score += 22; list.push({ label: "Suspicious TLD", score: 22, desc: ".click/.xyz abused for phishing" })
  }
  if (l.includes("verify") || l.includes("claim")) {
    score += 15; list.push({ label: "Credential Harvest", score: 15, desc: "verify/claim keywords" })
  }
  return { score: Math.min(98, score), list }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  const { score, list } = checkUrl(url)
  let level = "SAFE"
  if (score >= 70) level = "DANGEROUS"
  else if (score >= 35) level = "SUSPICIOUS"

  return NextResponse.json({
    riskScore: score,
    riskLevel: level,
    indicators: list,
    pattern: level === "DANGEROUS" ? "Emerging Scam" : "No match",
    explanation: level === "DANGEROUS" ? "Real bank never uses .click/.xyz domain" : "Safe",
    advice: ["Don't enter OTP", "Call 1930"]
  })
}
