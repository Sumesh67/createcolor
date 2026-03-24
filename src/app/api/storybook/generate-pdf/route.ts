import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadPDF, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';

export const maxDuration = 60;

interface Character {
  label: string;
  description: string;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
  imageUrl?: string;
}

// Extract base64 data from data URL
function extractBase64(dataUrl: string): { data: Uint8Array; type: 'png' | 'jpg' } | null {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!match) return null;

  const type = match[1] === 'png' ? 'png' : 'jpg';
  const base64 = match[2];
  const data = Uint8Array.from(Buffer.from(base64, 'base64'));

  return { data, type };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, characters, pages, theme } = body as {
      title: string;
      characters: Character[];
      pages: StoryPage[];
      theme: string;
    };

    if (!title || !pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[Generate PDF] Creating storybook: "${title}" with ${pages.length} pages`);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Page dimensions (8.5 x 11 inches in points)
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;

    // Theme colors
    const themeColors: Record<string, { r: number; g: number; b: number }> = {
      space: { r: 0.5, g: 0.3, b: 0.7 },
      ocean: { r: 0.2, g: 0.6, b: 0.8 },
      fairytale: { r: 0.8, g: 0.4, b: 0.6 },
      dinosaur: { r: 0.4, g: 0.7, b: 0.3 },
      forest: { r: 0.2, g: 0.7, b: 0.5 },
    };
    const themeColor = themeColors[theme] || themeColors.space;

    // --- Cover Page ---
    const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Background color band at top
    coverPage.drawRectangle({
      x: 0,
      y: pageHeight - 200,
      width: pageWidth,
      height: 200,
      color: rgb(themeColor.r, themeColor.g, themeColor.b),
    });

    // Title
    const titleFontSize = 36;
    const titleWidth = helveticaBold.widthOfTextAtSize(title, titleFontSize);
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 130,
      size: titleFontSize,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    // "Starring" text
    const starringText = 'Starring:';
    coverPage.drawText(starringText, {
      x: margin,
      y: pageHeight - 280,
      size: 18,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Character names
    let yPos = pageHeight - 310;
    for (const char of characters) {
      coverPage.drawText(`• ${char.label}`, {
        x: margin + 20,
        y: yPos,
        size: 14,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPos -= 25;
    }

    // Created with watermark on cover
    const watermarkText = 'Created with CreateAndColor.app';
    const watermarkWidth = helvetica.widthOfTextAtSize(watermarkText, 12);
    coverPage.drawText(watermarkText, {
      x: (pageWidth - watermarkWidth) / 2,
      y: margin,
      size: 12,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // --- Story Pages ---
    for (const page of pages) {
      const storyPage = pdfDoc.addPage([pageWidth, pageHeight]);

      // Page number header
      const pageNumText = `Page ${page.pageNumber}`;
      storyPage.drawText(pageNumText, {
        x: pageWidth - margin - helvetica.widthOfTextAtSize(pageNumText, 10),
        y: pageHeight - 30,
        size: 10,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Image area (if available as base64)
      let textStartY = pageHeight - margin;

      if (page.imageUrl?.startsWith('data:image')) {
        try {
          const imageData = extractBase64(page.imageUrl);
          if (imageData) {
            let image = null;
            // Try JPG first (most common from AI), then PNG
            try {
              image = await pdfDoc.embedJpg(imageData.data);
            } catch {
              try {
                image = await pdfDoc.embedPng(imageData.data);
              } catch {
                console.log(`[Generate PDF] Could not embed image for page ${page.pageNumber}`);
              }
            }

            if (image) {
              const imgWidth = pageWidth - 2 * margin;
              const imgHeight = (imgWidth * image.height) / image.width;
              const maxImgHeight = 350;
              const finalHeight = Math.min(imgHeight, maxImgHeight);
              const finalWidth = (finalHeight * image.width) / image.height;

              storyPage.drawImage(image, {
                x: (pageWidth - finalWidth) / 2,
                y: pageHeight - margin - finalHeight,
                width: finalWidth,
                height: finalHeight,
              });

              textStartY = pageHeight - margin - finalHeight - 20;
              console.log(`[Generate PDF] Embedded image for page ${page.pageNumber}`);
            }
          }
        } catch (imgError) {
          console.error(`[Generate PDF] Error embedding image for page ${page.pageNumber}:`, imgError);
          // Continue without image
          textStartY = pageHeight - margin - 50;
        }
      }

      if (!page.imageUrl?.startsWith('data:image') || textStartY === pageHeight - margin) {
        // No image - add decorative page number
        storyPage.drawCircle({
          x: pageWidth / 2,
          y: pageHeight - 100,
          size: 40,
          color: rgb(themeColor.r * 0.3, themeColor.g * 0.3, themeColor.b * 0.3),
          opacity: 0.1,
        });

        const pageNumBig = String(page.pageNumber);
        const pageNumBigWidth = helveticaBold.widthOfTextAtSize(pageNumBig, 32);
        storyPage.drawText(pageNumBig, {
          x: (pageWidth - pageNumBigWidth) / 2,
          y: pageHeight - 115,
          size: 32,
          font: helveticaBold,
          color: rgb(themeColor.r, themeColor.g, themeColor.b),
        });

        textStartY = pageHeight - 180;
      }

      // Story text - word wrap
      const maxTextWidth = pageWidth - 2 * margin;
      const fontSize = 16;
      const lineHeight = 24;
      // Sanitize text: remove newlines and extra whitespace (WinAnsi encoding doesn't support them)
      const sanitizedText = page.storyText.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      const words = sanitizedText.split(' ');
      let currentLine = '';
      let currentY = textStartY - 20;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = helvetica.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxTextWidth && currentLine) {
          storyPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: helvetica,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentLine = word;
          currentY -= lineHeight;
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text
      if (currentLine) {
        storyPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      // Footer watermark
      storyPage.drawText(watermarkText, {
        x: (pageWidth - watermarkWidth) / 2,
        y: 30,
        size: 10,
        font: helvetica,
        color: rgb(0.7, 0.7, 0.7),
      });
    }

    // --- Back Cover ---
    const backCover = pdfDoc.addPage([pageWidth, pageHeight]);

    // "The End" text
    const endText = 'The End';
    const endTextWidth = helveticaBold.widthOfTextAtSize(endText, 48);
    backCover.drawText(endText, {
      x: (pageWidth - endTextWidth) / 2,
      y: pageHeight / 2 + 50,
      size: 48,
      font: helveticaBold,
      color: rgb(themeColor.r, themeColor.g, themeColor.b),
    });

    // Draw decorative circles instead of heart (simpler, works with PDF)
    const decorY = pageHeight / 2 - 50;
    backCover.drawCircle({
      x: pageWidth / 2 - 40,
      y: decorY,
      size: 25,
      color: rgb(0.9, 0.3, 0.4),
    });
    backCover.drawCircle({
      x: pageWidth / 2,
      y: decorY,
      size: 30,
      color: rgb(themeColor.r, themeColor.g, themeColor.b),
    });
    backCover.drawCircle({
      x: pageWidth / 2 + 40,
      y: decorY,
      size: 25,
      color: rgb(0.9, 0.3, 0.4),
    });

    // Final watermark
    backCover.drawText('Made with love at CreateAndColor.app', {
      x: (pageWidth - helvetica.widthOfTextAtSize('Made with love at CreateAndColor.app', 14)) / 2,
      y: margin,
      size: 14,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    console.log(`[Generate PDF] Generated PDF: ${pdfBuffer.length} bytes`);

    // Upload or encode
    let pdfUrl: string;
    if (isS3Configured()) {
      pdfUrl = await uploadPDF(pdfBuffer);
    } else {
      pdfUrl = bufferToDataUrl(pdfBuffer, 'application/pdf');
    }

    return NextResponse.json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    console.error('[Generate PDF] Error:', error);
    return NextResponse.json(
      {
        error: 'PDF generation failed',
        message: 'Could not create the PDF. Please try again.',
      },
      { status: 500 }
    );
  }
}
