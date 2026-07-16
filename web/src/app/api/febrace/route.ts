import { NextResponse } from 'next/server'
import { getFebraceData } from '@/lib/store'

export async function GET() {
  const data = await getFebraceData()
  return NextResponse.json(data)
}
