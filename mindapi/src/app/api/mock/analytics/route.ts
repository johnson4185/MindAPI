import { NextResponse } from 'next/server'
import { getAnalyticsSnapshot } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(getAnalyticsSnapshot())
}
