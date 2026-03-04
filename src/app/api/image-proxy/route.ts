import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

async function fetchWithRetry(url: string, maxRetries: number = 15): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[Image Proxy] Attempt ${attempt + 1}/${maxRetries} for ${url.substring(0, 80)}...`);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CreateColor/1.0',
          'Accept': 'image/*',
        },
      });

      console.log(`[Image Proxy] Attempt ${attempt + 1} status: ${response.status}`);

      if (response.ok) {
        return response;
      }

      // If 530 (generating), wait and retry
      if (response.status === 530) {
        console.log(`[Image Proxy] Image generating, waiting 3s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      // Other non-ok status, throw to trigger retry
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log(`[Image Proxy] Attempt ${attempt + 1} error:`, error);
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw new Error('Max retries exceeded');
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // Only allow Pollinations.ai URLs
  if (!url.includes('pollinations.ai')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetchWithRetry(url);
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    console.log(`[Image Proxy] Success! Returning ${imageBuffer.byteLength} bytes`);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Image Proxy] Final error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image after retries' },
      { status: 503 }
    );
  }
}
