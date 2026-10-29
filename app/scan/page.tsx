"use client"
import { useState } from "react"

export default function ScanPage() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function doScan() {
    setLoading(true)
    const res = await fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff", minHeight: "100vh" }}>
      <h1>CyberShield Scan</h1>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste URL" style={{ width: "100%", padding: 12, color: "#000" }} />
      <button onClick={doScan} style={{ marginTop: 10, padding: "10px 20px", background: "#00f2ea", color: "#000" }}>{loading ? "Scanning..." : "Scan"}</button>
      {result && (
        <div style={{ marginTop: 20, border: "1px solid #333", padding: 15 }}>
          <h2 style={{ color: result.riskLevel === "DANGEROUS" ? "red" : "green" }}>{result.riskLevel} - {result.riskScore}</h2>
          <p>{result.explanation}</p>
          {result.indicators.map((i: any, k: number) => <div key={k}>- {i.label} ({i.score}) : {i.desc}</div>)}
        </div>
      )}
    </div>
  )
}
