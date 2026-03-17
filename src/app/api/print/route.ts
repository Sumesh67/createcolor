import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import PrintJob from '@/lib/db/models/PrintJob';
import mongoose from 'mongoose';
import { PrintLayout } from '@/types';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const maxDuration = 30;

interface SessionUser {
  id?: string;
}

async function generatePdfWithWatermark(imageUrl: string): Promise<string> {
  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  const imageBytes = await imageResponse.arrayBuffer();

  // Create PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed the image (try PNG first, then JPG)
  let image;
  try {
    image = await pdfDoc.embedPng(imageBytes);
  } catch {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  // Create page with image dimensions (letter size max)
  const { width, height } = image.scale(1);
  const maxWidth = 612; // 8.5 inches
  const maxHeight = 792; // 11 inches

  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const page = pdfDoc.addPage([maxWidth, maxHeight]);

  // Center the image
  const x = (maxWidth - scaledWidth) / 2;
  const y = (maxHeight - scaledHeight) / 2 + 20; // Offset for watermark

  page.drawImage(image, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight,
  });

  // Add watermark
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const watermarkText = 'Created for free at CreateColor.app';
  const fontSize = 10;
  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

  page.drawText(watermarkText, {
    x: (maxWidth - textWidth) / 2,
    y: 15,
    size: fontSize,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Save and return as base64 data URL
  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString('base64');
  return `data:application/pdf;base64,${base64}`;
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

    // Generate PDF with watermark
    const pdfUrl = await generatePdfWithWatermark(imageUrl);

    // Generate QR code for the app
    const qrCodeDataUrl = await QRCode.toDataURL('https://createcolor.vercel.app', {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Save PrintJob and get print count if user is authenticated
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    let printCount = 0;

    if (userId) {
      await connectDB();

      if (pageId && !pageId.startsWith('temp_')) {
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
            pdfUrl: imageUrl, // Store original image URL
            qrCode: qrCodeDataUrl,
            status: 'complete',
          });
        }
      }

      // Get total print count for this user
      printCount = await PrintJob.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    return NextResponse.json({
      pdfUrl,
      qrCodeUrl: qrCodeDataUrl,
      layout,
      printCount,
    });
  } catch (error) {
    console.error('Error generating print:', error);
    return NextResponse.json(
      { error: 'Failed to generate print' },
      { status: 500 }
    );
  }
}
