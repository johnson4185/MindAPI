import { NextResponse } from 'next/server'
import { getConsumer, updateConsumer } from '@/lib/server/mock-db'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const consumer = getConsumer(id)
  if (!consumer) return NextResponse.json({ message: 'Consumer not found' }, { status: 404 })
  return NextResponse.json(consumer)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const patch = await request.json()
  const consumer = updateConsumer(id, patch)
  if (!consumer) return NextResponse.json({ message: 'Consumer not found' }, { status: 404 })
  return NextResponse.json(consumer)
}
