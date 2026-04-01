import { NextResponse } from 'next/server'
import { deleteApi, getApi, updateApi } from '@/lib/server/mock-db'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const api = getApi(id)
  if (!api) return NextResponse.json({ message: 'API not found' }, { status: 404 })
  return NextResponse.json(api)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const patch = await request.json()
  const api = updateApi(id, patch)
  if (!api) return NextResponse.json({ message: 'API not found' }, { status: 404 })
  return NextResponse.json(api)
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const deleted = deleteApi(id)
  if (!deleted) return NextResponse.json({ message: 'API not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
