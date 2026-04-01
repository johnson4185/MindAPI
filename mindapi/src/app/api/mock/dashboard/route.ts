import { NextResponse } from 'next/server'
import { getDashboardSnapshot } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(getDashboardSnapshot())
}
