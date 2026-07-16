import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI

  if (clientId && redirectUri) {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'User.Read Files.ReadWrite.All',
      response_mode: 'query',
    })

    return NextResponse.redirect(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
    )
  }

  // Dev mode: redirect directly to callback to simulate login
  return NextResponse.redirect(new URL('/api/auth/callback?code=dev_mode', request.url))
}
