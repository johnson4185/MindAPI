import { NextResponse } from 'next/server'
import { getWorkspaceSnapshot } from '@/lib/server/mock-db'

export async function GET() {
  return NextResponse.json(getWorkspaceSnapshot())
}
