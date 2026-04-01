import { NextResponse } from 'next/server'
import { createConsumerKey, listConsumerKeys } from '@/lib/server/mock-db'
import { ConsumerKey } from '@/lib/types'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return NextResponse.json(listConsumerKeys(id))
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const key = (await request.json()) as ConsumerKey
  return NextResponse.json(createConsumerKey({ ...key, consumerId: id }), { status: 201 })
}
