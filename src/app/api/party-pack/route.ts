import { NextRequest, NextResponse } from "next/server";
import { generateColoringPage, generateVariationPrompts } from "@/lib/ai/generateColoringPage";
import { processImageForColoring, fetchImage } from "@/lib/image/processImage";
import { uploadImage, isS3Configured, bufferToDataUrl } from "@/lib/storage/uploadImage";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import { PrintLayout } from "@/types";
import { PDFDocument, PDFPage, PDFFont, PDFImage, rgb, StandardFonts } from "pdf-lib";
import { generateQRPngBytes } from "@/lib/pdf/qrCodeHelper";
import { getServerSession } from "next-auth";
import { authOptions, extractTokenFromRequest, verifyJWT, getRequestUserRole } from "@/lib/auth";

export const maxDuration = 300; // 5 minutes for bulk generation

interface SessionUser { id?: string; }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const PAGE_W = 612;
const PAGE_H = 792;
const FOOTER_H = 60;
const QR_SIZE = 44;
const FOOTER_PADDING = 20;

function drawPartyFooter(
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  qrImage: PDFImage
): void {
  page.drawRectangle({
    x: 0, y: 0,
    width: PAGE_W, height: FOOTER_H,
    color: rgb(0.976, 0.980, 0.984),
    borderColor: rgb(0.898, 0.906, 0.918),
    borderWidth: 0.5,
  });
  page.drawText('Created with Magic at CreateAndColor.com', {
    x: FOOTER_PADDING,
    y: FOOTER_H - 22,
    size: 10,
    font: boldFont,
    color: rgb(0.294, 0.333, 0.388),
  });
  page.drawText('Turn imagination into coloring pages!', {
    x: FOOTER_PADDING,
    y: FOOTER_H - 38,
    size: 8,
    font,
    color: rgb(0.612, 0.639, 0.686),
  });
  const captionText = 'Scan to make your own!';
  const captionW = font.widthOfTextAtSize(captionText, 8);
  page.drawText(captionText, {
    x: PAGE_W - FOOTER_PADDING - QR_SIZE - captionW - 8,
    y: FOOTER_H / 2 - 4,
    size: 8,
    font,
    color: rgb(0.976, 0.451, 0.086),
  });
  const qrX = PAGE_W - FOOTER_PADDING - QR_SIZE;
  const qrY = (FOOTER_H - QR_SIZE) / 2;
  page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: QR_SIZE + 4, height: QR_SIZE + 4, color: rgb(1, 1, 1) });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: QR_SIZE, height: QR_SIZE });
}

async function imageUrlToBytes(url: string): Promise<Uint8Array> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    return Buffer.from(base64, "base64");
  }
  const res = await fetch(url);
  return new Uint8Array(await res.arrayBuffer());
}

async function buildPartyPackPdf(
  pageUrls: string[],
  theme: string,
  childName?: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const qrBytes = await generateQRPngBytes('party');
  // Embed QR image once; reuse across all pages
  const qrImage = await pdfDoc.embedPng(qrBytes);

  // Cover page
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const title = childName ? `${childName}'s Party Pack` : "Party Pack";

  cover.drawText(title, {
    x: PAGE_W / 2 - boldFont.widthOfTextAtSize(title, 28) / 2,
    y: PAGE_H / 2 + 20,
    size: 28,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  cover.drawText(theme, {
    x: PAGE_W / 2 - font.widthOfTextAtSize(theme, 16) / 2,
    y: PAGE_H / 2 - 20,
    size: 16,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  cover.drawText(`${pageUrls.length} coloring pages`, {
    x: PAGE_W / 2 - font.widthOfTextAtSize(`${pageUrls.length} coloring pages`, 12) / 2,
    y: PAGE_H / 2 - 50,
    size: 12,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });
  drawPartyFooter(cover, font, boldFont, qrImage);

  // One image per page
  for (const url of pageUrls) {
    try {
      const bytes = await imageUrlToBytes(url);
      let image;
      try {
        image = await pdfDoc.embedPng(bytes);
      } catch {
        image = await pdfDoc.embedJpg(bytes);
      }

      const { width, height } = image.scale(1);
      const margin = 36;
      const availW = PAGE_W - margin * 2;
      const availH = PAGE_H - margin * 2 - FOOTER_H;
      const scale = Math.min(availW / width, availH / height, 1);

      const scaledW = width * scale;
      const scaledH = height * scale;
      const x = (PAGE_W - scaledW) / 2;
      const y = FOOTER_H + (availH - scaledH) / 2 + margin;

      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      page.drawImage(image, { x, y, width: scaledW, height: scaledH });
      drawPartyFooter(page, font, boldFont, qrImage);
    } catch {
      // Skip pages that fail to embed
    }
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString("base64");
  return `data:application/pdf;base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    // Hybrid auth: JWT (mobile) or NextAuth session (web)
    let userId: string | undefined;
    const token = extractTokenFromRequest(request);
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) userId = decoded.id;
    }
    if (!userId) {
      const session = await getServerSession(authOptions);
      userId = (session?.user as SessionUser)?.id;
    }

    // Admins bypass all rate limits
    const userRole = await getRequestUserRole(request);
    const isAdmin = userRole === 'ADMIN';

    const identifier = userId ?? getRateLimitIdentifier(request);
    const rateLimit = isAdmin
      ? { allowed: true, remaining: 999, resetIn: 0 }
      : checkRateLimit(identifier, { maxRequests: 2, windowMs: 24 * 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      const hoursUntilReset = Math.ceil(rateLimit.resetIn / (60 * 60 * 1000));
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `You've used your 2 free party packs for today! Come back in ${hoursUntilReset} hour${hoursUntilReset === 1 ? "" : "s"}.`,
          resetIn: rateLimit.resetIn,
        },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { theme, count = 2, layout = "single", childName } = body as {
      theme: string;
      count?: number;
      layout?: PrintLayout;
      childName?: string;
    };

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400, headers: corsHeaders });
    }

    // Cap at 2 pages for now (cost control on FLUX.1.1-pro). Clamp rather than
    // reject so older clients sending a larger count still succeed.
    const MAX_COUNT = 2;
    const safeCount = Math.min(Math.max(Math.floor(count) || 1, 1), MAX_COUNT);

    // Generate variation prompts
    const prompts = await generateVariationPrompts(theme, safeCount);

    // Generate coloring pages sequentially to avoid rate limiting
    const pageUrls: string[] = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        const result = await generateColoringPage(prompts[i]);
        const imageBuffer = await fetchImage(result.imageUrl);
        const processedBuffer = await processImageForColoring(imageBuffer);

        const url = isS3Configured()
          ? await uploadImage(processedBuffer)
          : bufferToDataUrl(processedBuffer);

        pageUrls.push(url);
        console.log(`[PartyPack] Generated page ${i + 1}/${prompts.length}`);
      } catch (error) {
        console.error(`[PartyPack] Failed page ${i + 1}:`, error);
      }

      // 2s gap between requests to stay within rate limits
      if (i < prompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Build a multi-page PDF from all generated images
    const pdfUrl = await buildPartyPackPdf(pageUrls, theme, childName);

    return NextResponse.json({
      pdfUrl,
      pageUrls,
      pageCount: pageUrls.length,
      theme,
      childName,
      layout,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error generating party pack:", error);
    return NextResponse.json(
      {
        error: "Generation failed",
        message: "Couldn't generate the party pack. Please try again!",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
