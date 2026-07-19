import { redirect } from 'next/navigation'
import { getAuthUrl } from '@/lib/google'

export async function GET() {
  redirect(getAuthUrl())
}
