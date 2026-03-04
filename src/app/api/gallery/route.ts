import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import mongoose from 'mongoose';

interface SessionUser {
  id?: string;
  role?: string;
}

// GET /api/gallery - Fetch user's saved pages or public pages
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all';
    const publicOnly = searchParams.get('public') === 'true';

    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    // Build query
    let query: Record<string, unknown> = {};

    if (publicOnly || !userId) {
      // Return community/public pages
      query = { isPublic: true };
    } else {
      // Return user's pages
      query = { userId: new mongoose.Types.ObjectId(userId) };

      if (filter === 'public') {
        query.isPublic = true;
      } else if (filter === 'private') {
        query.isPublic = false;
      } else if (filter === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query.createdAt = { $gte: weekAgo };
      }
    }

    const [pages, total] = await Promise.all([
      ColoringPage.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ColoringPage.countDocuments(query),
    ]);

    return NextResponse.json({
      pages: pages.map((p) => ({
        ...p,
        id: p._id.toString(),
        userId: p.userId.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Save a page to gallery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { prompt, imageUrl, thumbnailUrl, tags, isPublic } = body;

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: 'prompt and imageUrl are required' },
        { status: 400 }
      );
    }

    const page = await ColoringPage.create({
      userId: new mongoose.Types.ObjectId(userId),
      prompt,
      imageUrl,
      thumbnailUrl,
      tags: tags || [],
      isPublic: isPublic || false,
    });

    return NextResponse.json({
      page: {
        ...page.toObject(),
        id: page._id.toString(),
        userId: page.userId.toString(),
      },
    });
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return NextResponse.json(
      { error: 'Failed to save page' },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json({ error: 'pageId required' }, { status: 400 });
    }

    // Verify ownership and delete
    const result = await ColoringPage.deleteOne({
      _id: new mongoose.Types.ObjectId(pageId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Page not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

// PATCH /api/gallery - Update page visibility
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { pageId, isPublic } = body;

    if (!pageId || typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'pageId and isPublic required' },
        { status: 400 }
      );
    }

    const page = await ColoringPage.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(pageId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { isPublic },
      { new: true }
    );

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      page: {
        ...page.toObject(),
        id: page._id.toString(),
        userId: page.userId.toString(),
      },
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}
