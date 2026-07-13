import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    const parsedUrl = new URL(targetUrl)

    // 1. Enforce HTTP/HTTPS protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return new NextResponse('Forbidden protocol', { status: 400 })
    }

    const hostname = parsedUrl.hostname.toLowerCase()

    // 2. Prevent fetching from local, loopback, or private subnetworks
    const isBlockedHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)

    if (isBlockedHost) {
      return new NextResponse('Access to internal host is forbidden', { status: 403 })
    }

    // 3. Fetch target resource
    const res = await fetch(targetUrl, {
      next: { revalidate: 3600 }, // Cache the proxy result on the Next.js server
    })

    if (!res.ok) {
      return new NextResponse(`Failed to fetch target: ${res.statusText}`, { status: res.status })
    }

    // 4. Enforce that the response is strictly an image
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return new NextResponse('Forbidden content type', { status: 400 })
    }

    const buffer = await res.arrayBuffer()

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

