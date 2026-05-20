import { NextRequest, NextResponse } from "next/server";
import { generateColoringPage, generateVariationPrompts } from "@/lib/ai/generateColoringPage";
import { processImageForColoring, fetchImage } from "@/lib/image/processImage";
import { uploadImage, isS3Configured, bufferToDataUrl } from "@/lib/storage/uploadImage";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import { PrintLayout } from "@/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const maxDuration = 300; // 5 minutes for bulk generation

const PAGE_W = 612; // 8.5 in
const PAGE_H = 792; // 11 in

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

  // Cover page
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const title = childName ? `${childName}'s Party Pack` : "Party Pack";
  const subtitle = theme;
  const watermark = "Created free at CreateAndColor.app";

  cover.drawText(title, {
    x: PAGE_W / 2 - font.widthOfTextAtSize(title, 28) / 2,
    y: PAGE_H / 2 + 20,
    size: 28,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  cover.drawText(subtitle, {
    x: PAGE_W / 2 - font.widthOfTextAtSize(subtitle, 16) / 2,
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
  cover.drawText(watermark, {
    x: PAGE_W / 2 - font.widthOfTextAtSize(watermark, 9) / 2,
    y: 15,
    size: 9,
    font,
    color: rgb(0.7, 0.7, 0.7),
  });

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
      const availH = PAGE_H - margin * 2 - 20; // 20px for watermark
      const scale = Math.min(availW / width, availH / height, 1);

      const scaledW = width * scale;
      const scaledH = height * scale;
      const x = (PAGE_W - scaledW) / 2;
      const y = (PAGE_H - scaledH) / 2 + 10;

      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      page.drawImage(image, { x, y, width: scaledW, height: scaledH });
      page.drawText(watermark, {
        x: PAGE_W / 2 - font.widthOfTextAtSize(watermark, 8) / 2,
        y: 12,
        size: 8,
        font,
        color: rgb(0.75, 0.75, 0.75),
      });
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
    // Rate limiting - stricter for party packs
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(identifier, { maxRequests: 5, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "You've generated too many party packs. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { theme, count = 10, layout = "single", childName } = body as {
      theme: string;
      count?: number;
      layout?: PrintLayout;
      childName?: string;
    };

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 });
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Generate variation prompts
    const prompts = await generateVariationPrompts(theme, count);

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
    });
  } catch (error) {
    console.error("Error generating party pack:", error);
    return NextResponse.json(
      {
        error: "Generation failed",
        message: "Couldn't generate the party pack. Please try again!",
      },
      { status: 500 }
    );
  }
}
