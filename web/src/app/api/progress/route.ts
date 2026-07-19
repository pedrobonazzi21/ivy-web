import { NextResponse } from 'next/server'
import { getStats } from '@/lib/store'
import { getSession } from '@/lib/session'

export async function GET() {
  const stats = await getStats()
  return NextResponse.json(stats)
}
