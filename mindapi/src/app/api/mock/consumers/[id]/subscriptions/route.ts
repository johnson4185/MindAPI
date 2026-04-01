import { NextResponse } from 'next/server'
import { listSubscriptions } from '@/lib/server/mock-db'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return NextResponse.json(listSubscriptions(id))
}
