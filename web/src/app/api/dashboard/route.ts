import { NextResponse } from 'next/server'
import { getStats, getActivitiesPaginated } from '@/lib/store'

export async function GET() {
  const stats = await getStats()
  const { activities, total } = await getActivitiesPaginated(1, 10)
  return NextResponse.json({ stats, activities, totalActivities: total })
}
