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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const status = await getSparkStatus(userId);

    return NextResponse.json({
      remaining: status.remaining,
      resetAt: status.resetAt?.toISOString(),
      success: status.success,
    });
  } catch (error) {
    console.error('[Storybook Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get storybook status' },
      { status: 500 }
    );
  }
}
