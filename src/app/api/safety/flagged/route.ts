import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFlaggedPrompts, getFlaggedPromptCount } from '@/lib/safety/image-moderator';

interface SessionUser {
  id?: string;
}

// GET /api/safety/flagged - Get flagged attempts for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flaggedPrompts = await getFlaggedPrompts(userId);
    const count = await getFlaggedPromptCount(userId);

    // Format for display (hide actual prompts for privacy)
    const attempts = flaggedPrompts.map((fp) => ({
      id: fp.sessionId || String(fp.createdAt),
      date: new Date(fp.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      category: fp.reason || 'Content filtered',
    }));

    return NextResponse.json({
      attempts,
      count,
    });
  } catch (error) {
    console.error('Error fetching flagged attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flagged attempts' },
      { status: 500 }
    );
  }
}

// DELETE /api/safety/flagged - Clear flagged attempts history
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement clearing flagged prompts for user
    // await clearFlaggedPrompts(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing flagged attempts:', error);
    return NextResponse.json(
      { error: 'Failed to clear flagged attempts' },
      { status: 500 }
    );
  }
}
