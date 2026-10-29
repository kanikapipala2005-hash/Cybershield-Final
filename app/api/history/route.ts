import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory for demo, for production use Vercel KV or Supabase
let globalHistory: any[] = []

export async function POST(req: NextRequest) {
  const data = await req.json()
  globalHistory.unshift({ ...data, timestamp: new Date() })
  globalHistory = globalHistory.slice(0, 100)
  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json(globalHistory)
}
