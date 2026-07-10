import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    // Fetch target image server-side
    const res = await fetch(targetUrl, {
      next: { revalidate: 3600 }, // Cache the proxy result on the Next.js server
    })

    if (!res.ok) {
      return new NextResponse(`Failed to fetch target image: ${res.statusText}`, { status: res.status })
    }

    const contentType = res.headers.get('content-type')
    const buffer = await res.arrayBuffer()

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
