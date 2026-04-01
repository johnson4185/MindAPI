import { NextResponse } from 'next/server'
import { createApi, listApis } from '@/lib/server/mock-db'
import { API } from '@/lib/types'

export async function GET() {
  return NextResponse.json(listApis())
}

export async function POST(request: Request) {
  const api = (await request.json()) as API
  return NextResponse.json(createApi(api), { status: 201 })
}
