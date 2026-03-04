import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import PrintJob from '@/lib/db/models/PrintJob';
import mongoose from 'mongoose';
import { PrintLayout } from '@/types';
import QRCode from 'qrcode';

export const maxDuration = 30;

interface SessionUser {
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, imageUrl, layout = 'single' } = body as {
      pageId?: string;
      imageUrl: string;
      layout?: PrintLayout;
    };

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
    }

    // For now, use the image URL directly as the PDF URL
    // In production, use @react-pdf/renderer for proper PDF generation
    const pdfUrl = imageUrl;

    // Generate QR code for the PDF
    const qrCodeDataUrl = await QRCode.toDataURL(pdfUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Save PrintJob if user is authenticated
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (userId && pageId && !pageId.startsWith('temp_')) {
      await connectDB();

      // Verify page exists and belongs to user
      const page = await ColoringPage.findOne({
        _id: new mongoose.Types.ObjectId(pageId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (page) {
        await PrintJob.create({
          userId: new mongoose.Types.ObjectId(userId),
          pageId: new mongoose.Types.ObjectId(pageId),
          layout,
          pdfUrl,
          qrCode: qrCodeDataUrl,
          status: 'complete',
        });
      }
    }

    return NextResponse.json({
      pdfUrl,
      qrCodeUrl: qrCodeDataUrl,
      layout,
    });
  } catch (error) {
    console.error('Error generating print:', error);
    return NextResponse.json(
      { error: 'Failed to generate print' },
      { status: 500 }
    );
  }
}
