import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  // Only proxy assets from our R2 CDN — block arbitrary SSRF
  const allowed = process.env.R2_PUBLIC_URL
  if (!allowed || !url.startsWith(allowed + '/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let upstream: Response
  try {
    upstream = await fetch(url)
  } catch {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
  }

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status })
  }

  const contentType = upstream.headers.get('Content-Type') ?? 'image/webp'

  return new Response(upstream.body, {
    headers: {
      'Content-Type':                contentType,
      'Cache-Control':               'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
