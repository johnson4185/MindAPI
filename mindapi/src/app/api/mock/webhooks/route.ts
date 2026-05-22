import { NextResponse } from 'next/server'
import { listWebhooks } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(listWebhooks())
}
