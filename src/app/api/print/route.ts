import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import ColoringPage from '@/lib/db/models/ColoringPage';
import PrintJob from '@/lib/db/models/PrintJob';
import mongoose from 'mongoose';
import { PrintLayout } from '@/types';
import QRCode from 'qrcode';
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import { getScanUrl, generateQRPngBytes } from '@/lib/pdf/qrCodeHelper';

export const maxDuration = 30;

const FOOTER_H = 60;
const QR_SIZE = 44;
const FOOTER_PADDING = 20;

interface SessionUser {
  id?: string;
}

async function drawViralFooter(
  page: PDFPage,
  pdfDoc: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  qrBytes: Buffer,
  pageWidth: number,
  context: 'coloring' | 'worksheet' | 'party' | 'storybook'
): Promise<void> {
  // Footer background
  page.drawRectangle({
    x: 0, y: 0,
    width: pageWidth, height: FOOTER_H,
    color: rgb(0.976, 0.980, 0.984),
    borderColor: rgb(0.898, 0.906, 0.918),
    borderWidth: 0.5,
  });

  // Primary text
  const primaryText = 'Created with Magic at CreateAndColor.com';
  page.drawText(primaryText, {
    x: FOOTER_PADDING,
    y: FOOTER_H - 22,
    size: 10,
    font: boldFont,
    color: rgb(0.294, 0.333, 0.388),
  });

  // Sub text
  page.drawText('Turn imagination into coloring pages!', {
    x: FOOTER_PADDING,
    y: FOOTER_H - 38,
    size: 8,
    font,
    color: rgb(0.612, 0.639, 0.686),
  });

  // Scan caption
  const captionText = 'Scan to make your own!';
  const captionW = font.widthOfTextAtSize(captionText, 8);
  page.drawText(captionText, {
    x: pageWidth - FOOTER_PADDING - QR_SIZE - captionW - 8,
    y: FOOTER_H / 2 - 4,
    size: 8,
    font,
    color: rgb(0.976, 0.451, 0.086),
  });

  // QR code image (white bg for clean scanning)
  const qrImage = await pdfDoc.embedPng(qrBytes);
  const qrX = pageWidth - FOOTER_PADDING - QR_SIZE;
  const qrY = (FOOTER_H - QR_SIZE) / 2;
  page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: QR_SIZE + 4, height: QR_SIZE + 4, color: rgb(1, 1, 1) });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });

  void context;
}

async function generatePdfWithWatermark(imageUrl: string): Promise<string> {
  const imageResponse = await fetch(imageUrl);
  const imageBytes = await imageResponse.arrayBuffer();

  const pdfDoc = await PDFDocument.create();

  let image;
  try {
    image = await pdfDoc.embedPng(imageBytes);
  } catch {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  const { width, height } = image.scale(1);
  const maxWidth = 612;
  const maxHeight = 792;
  const availH = maxHeight - FOOTER_H;

  const scale = Math.min(maxWidth / width, availH / height, 1);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const page = pdfDoc.addPage([maxWidth, maxHeight]);

  // Center image in the area above the footer
  const x = (maxWidth - scaledWidth) / 2;
  const y = FOOTER_H + (availH - scaledHeight) / 2;
  page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });

  // Viral footer with QR code
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrBytes = await generateQRPngBytes('coloring');
  console.log('[Print] QR bytes length:', qrBytes.length);
  await drawViralFooter(page, pdfDoc, font, boldFont, qrBytes, maxWidth, 'coloring');
  console.log('[Print] Footer drawn');

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

    const pdfUrl = await generatePdfWithWatermark(imageUrl);
    const scanUrl = getScanUrl('coloring');

    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;
    let printCount = 0;

    if (userId) {
      await connectDB();

      if (pageId && !pageId.startsWith('temp_')) {
        const page = await ColoringPage.findOne({
          _id: new mongoose.Types.ObjectId(pageId),
          userId: new mongoose.Types.ObjectId(userId),
        });

        if (page) {
          await PrintJob.create({
            userId: new mongoose.Types.ObjectId(userId),
            pageId: new mongoose.Types.ObjectId(pageId),
            layout,
            pdfUrl: imageUrl,
            qrCode: scanUrl,
            status: 'complete',
          });
        }
      }

      printCount = await PrintJob.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    return NextResponse.json({
      pdfUrl,
      qrCodeUrl: scanUrl,
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
