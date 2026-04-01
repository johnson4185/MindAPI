import { NextResponse } from 'next/server'
import { createConsumer, listConsumers } from '@/lib/server/mock-db'
import { Consumer } from '@/lib/types'

export async function GET() {
  return NextResponse.json(listConsumers())
}

export async function POST(request: Request) {
  const consumer = (await request.json()) as Consumer
  return NextResponse.json(createConsumer(consumer), { status: 201 })
}
