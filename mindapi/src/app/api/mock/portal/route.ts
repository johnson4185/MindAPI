import { NextResponse } from 'next/server'
import { getPortalSnapshot } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(getPortalSnapshot())
}
