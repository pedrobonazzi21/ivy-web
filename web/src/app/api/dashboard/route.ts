import { NextResponse } from 'next/server'
import { getStats, getActivities } from '@/lib/store'

export async function GET() {
  const stats = await getStats()
  const activities = await getActivities()
  return NextResponse.json({ stats, activities })
}
