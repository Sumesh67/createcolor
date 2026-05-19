import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSparkStatus } from '@/lib/auth/check-energy';

interface SessionUser {
  id?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const status = await getSparkStatus(userId);

    return NextResponse.json({
      remaining: status.remaining,
      resetAt: status.resetAt?.toISOString(),
    });
  } catch (error) {
    console.error('[Energy Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get energy status' },
      { status: 500 }
    );
  }
}
