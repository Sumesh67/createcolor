import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChalkboardStatus } from '@/lib/auth/check-energy';

interface SessionUser {
  id?: string;
  role?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher account required' }, { status: 403 });
    }

    const status = await getChalkboardStatus(user.id);

    return NextResponse.json({
      remaining: status.remaining,
      resetAt: status.resetAt?.toISOString(),
    });
  } catch (error) {
    console.error('[Teacher Credits] Error:', error);
    return NextResponse.json({ error: 'Failed to get credit status' }, { status: 500 });
  }
}
