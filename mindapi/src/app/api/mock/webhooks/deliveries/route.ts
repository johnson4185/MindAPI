import { NextResponse } from 'next/server'
import { listWebhookDeliveries } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(listWebhookDeliveries())
}
