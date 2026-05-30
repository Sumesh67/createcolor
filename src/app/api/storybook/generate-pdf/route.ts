import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFPage, PDFFont, PDFImage, rgb, StandardFonts } from 'pdf-lib';
import { uploadPDF, bufferToDataUrl, isS3Configured } from '@/lib/storage/uploadImage';
import { generateQRPngBytes } from '@/lib/pdf/qrCodeHelper';

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

function extractBase64(dataUrl: string): { data: Uint8Array; type: 'png' | 'jpg' } | null {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!match) return null;
  const type = match[1] === 'png' ? 'png' : 'jpg';
  const data = Uint8Array.from(Buffer.from(match[2], 'base64'));
  return { data, type };
}

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, fontSize: number, maxWidth: number): string[] {
  const sanitized = text.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = sanitized.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const FOOTER_H = 56;
const QR_SIZE = 42;
const FOOTER_PADDING = 20;

function drawStorybookFooter(
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  qrImage: PDFImage,
  pageWidth: number
): void {
  page.drawRectangle({
    x: 0, y: 0,
    width: pageWidth, height: FOOTER_H,
    color: rgb(0.976, 0.980, 0.984),
    borderColor: rgb(0.898, 0.906, 0.918),
    borderWidth: 0.5,
  });
  page.drawText('Created with Magic at CreateAndColor.com', {
    x: FOOTER_PADDING,
    y: FOOTER_H - 20,
    size: 10,
    font: boldFont,
    color: rgb(0.294, 0.333, 0.388),
  });
  page.drawText('Turn imagination into coloring pages!', {
    x: FOOTER_PADDING,
    y: FOOTER_H - 35,
    size: 8,
    font,
    color: rgb(0.612, 0.639, 0.686),
  });
  const captionText = 'Scan to make your own!';
  const captionW = font.widthOfTextAtSize(captionText, 8);
  page.drawText(captionText, {
    x: pageWidth - FOOTER_PADDING - QR_SIZE - captionW - 8,
    y: FOOTER_H / 2 - 4,
    size: 8,
    font,
    color: rgb(0.976, 0.451, 0.086),
  });
  const qrX = pageWidth - FOOTER_PADDING - QR_SIZE;
  const qrY = (FOOTER_H - QR_SIZE) / 2;
  page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: QR_SIZE + 4, height: QR_SIZE + 4, color: rgb(1, 1, 1) });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });
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
      return NextResponse.json({ error: 'Invalid request', message: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[Generate PDF] Creating landscape storybook: "${title}" with ${pages.length} pages`);

    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const qrBytes = await generateQRPngBytes('storybook');
    // Embed QR image once; reuse across all pages
    const qrImage = await pdfDoc.embedPng(qrBytes);

    // Landscape: 11 × 8.5 inches (792 × 612 points)
    const W = 792;
    const H = 612;
    const half = W / 2;   // 396 — fold line
    const margin = 40;

    const themeColors: Record<string, { r: number; g: number; b: number }> = {
      space:     { r: 0.5, g: 0.3, b: 0.7 },
      ocean:     { r: 0.2, g: 0.6, b: 0.8 },
      fairytale: { r: 0.8, g: 0.4, b: 0.6 },
      dinosaur:  { r: 0.4, g: 0.7, b: 0.3 },
      forest:    { r: 0.2, g: 0.7, b: 0.5 },
    };
    const tc = themeColors[theme] || themeColors.space;

    // ── Cover Page (landscape, full width) ──────────────────────────────────
    const cover = pdfDoc.addPage([W, H]);

    // Theme band across top quarter
    cover.drawRectangle({ x: 0, y: H - 160, width: W, height: 160, color: rgb(tc.r, tc.g, tc.b) });

    // Title
    const titleSize = 38;
    const titleText = title.length > 40 ? title.slice(0, 40) + '…' : title;
    const titleW = helveticaBold.widthOfTextAtSize(titleText, titleSize);
    cover.drawText(titleText, { x: (W - titleW) / 2, y: H - 110, size: titleSize, font: helveticaBold, color: rgb(1, 1, 1) });

    // Starring block (left side)
    cover.drawText('Starring:', { x: margin, y: H - 220, size: 16, font: helveticaBold, color: rgb(0.3, 0.3, 0.3) });
    let yPos = H - 248;
    for (const char of characters) {
      cover.drawText(`• ${char.label}`, { x: margin + 16, y: yPos, size: 13, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      yPos -= 22;
    }

    // Theme label (right side)
    const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1) + ' Adventure';
    cover.drawText(themeLabel, { x: W - margin - helveticaBold.widthOfTextAtSize(themeLabel, 14), y: H - 220, size: 14, font: helveticaBold, color: rgb(tc.r, tc.g, tc.b) });

    // Fold guide hint (raised above footer)
    cover.drawLine({ start: { x: half, y: FOOTER_H + 10 }, end: { x: half, y: H - 170 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8), dashArray: [4, 4] });

    // Viral footer
    drawStorybookFooter(cover, helvetica, helveticaBold, qrImage, W);

    // ── Story Pages (landscape, left = text, right = illustration) ──────────
    for (const page of pages) {
      const p = pdfDoc.addPage([W, H]);

      // Vertical fold divider (stop above footer)
      p.drawLine({ start: { x: half, y: FOOTER_H + 8 }, end: { x: half, y: H - 20 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });

      // ── LEFT HALF: story text ──
      const contentH = H - FOOTER_H;
      const textAreaW = half - 2 * margin;
      const fontSize = 18;
      const lineHeight = 28;

      const lines = wrapText(page.storyText, helvetica, fontSize, textAreaW);
      const blockHeight = lines.length * lineHeight;
      const textStartY = FOOTER_H + Math.floor((contentH + blockHeight) / 2) - lineHeight;

      lines.forEach((line, i) => {
        p.drawText(line, {
          x: margin,
          y: textStartY - i * lineHeight,
          size: fontSize,
          font: helvetica,
          color: rgb(0.15, 0.15, 0.15),
        });
      });

      // Page number (above footer)
      p.drawText(`${page.pageNumber}`, {
        x: margin,
        y: FOOTER_H + 8,
        size: 11,
        font: helveticaBold,
        color: rgb(tc.r, tc.g, tc.b),
      });

      // ── RIGHT HALF: illustration ──
      const imgX = half + margin / 2;
      const imgW = half - margin;
      const imgH = contentH - 2 * margin;

      if (page.imageUrl) {
        const src = page.imageUrl.startsWith('data:image') ? page.imageUrl : null;
        if (src) {
          try {
            const imgData = extractBase64(src);
            if (imgData) {
              let img = null;
              try { img = await pdfDoc.embedJpg(imgData.data); } catch { /* try png */ }
              if (!img) { try { img = await pdfDoc.embedPng(imgData.data); } catch { /* skip */ } }

              if (img) {
                const scale = Math.min(imgW / img.width, imgH / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const drawX = imgX + (imgW - drawW) / 2;
                const drawY = FOOTER_H + margin + (imgH - drawH) / 2;
                p.drawImage(img, { x: drawX, y: drawY, width: drawW, height: drawH });
              }
            }
          } catch (e) {
            console.error(`[Generate PDF] Image embed failed for page ${page.pageNumber}:`, e);
          }
        } else {
          const circleY = FOOTER_H + contentH / 2;
          p.drawCircle({ x: imgX + imgW / 2, y: circleY, size: 60, color: rgb(tc.r, tc.g, tc.b), opacity: 0.15 });
          const pn = String(page.pageNumber);
          p.drawText(pn, { x: imgX + imgW / 2 - helveticaBold.widthOfTextAtSize(pn, 36) / 2, y: circleY - 18, size: 36, font: helveticaBold, color: rgb(tc.r, tc.g, tc.b) });
        }
      }

      // Viral footer
      drawStorybookFooter(p, helvetica, helveticaBold, qrImage, W);
    }

    // ── Back Cover ──────────────────────────────────────────────────────────
    const back = pdfDoc.addPage([W, H]);

    const endText = 'The End';
    const endSize = 52;
    back.drawText(endText, {
      x: (W - helveticaBold.widthOfTextAtSize(endText, endSize)) / 2,
      y: H / 2 + 20,
      size: endSize,
      font: helveticaBold,
      color: rgb(tc.r, tc.g, tc.b),
    });

    // Three decorative dots (raised above footer)
    [-50, 0, 50].forEach((offset, i) => {
      back.drawCircle({ x: W / 2 + offset, y: H / 2 - 20, size: i === 1 ? 14 : 10, color: rgb(tc.r, tc.g, tc.b), opacity: i === 1 ? 1 : 0.5 });
    });

    drawStorybookFooter(back, helvetica, helveticaBold, qrImage, W);

    // Save
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    console.log(`[Generate PDF] Landscape PDF: ${pdfBuffer.length} bytes`);

    const pdfUrl = isS3Configured()
      ? await uploadPDF(pdfBuffer)
      : bufferToDataUrl(pdfBuffer, 'application/pdf');

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Generate PDF] Error:', msg);
    return NextResponse.json({ error: 'PDF generation failed', message: msg }, { status: 500 });
  }
}
