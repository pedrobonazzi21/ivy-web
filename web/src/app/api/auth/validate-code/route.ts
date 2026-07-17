import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code } = await request.json()
  const secret = process.env.SECRET_CODE

  if (!secret) {
    return NextResponse.json({ valid: true })
  }

  if (code === secret) {
    return NextResponse.json({ valid: true })
  }

  return NextResponse.json({ valid: false, error: 'Código secreto inválido' }, { status: 403 })
}
