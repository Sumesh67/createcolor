import { NextRequest, NextResponse } from "next/server";
import { generateColoringPage, generateVariationPrompts } from "@/lib/ai/generateColoringPage";
import { processImageForColoring, fetchImage } from "@/lib/image/processImage";
import { uploadImage, isS3Configured, bufferToDataUrl } from "@/lib/storage/uploadImage";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rateLimit";
import { PrintLayout } from "@/types";

export const maxDuration = 300; // 5 minutes for bulk generation

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

    // Generate coloring pages in batches
    const pageUrls: string[] = [];
    const batchSize = 3;

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      const batchPromises = batch.map(async (prompt) => {
        try {
          const result = await generateColoringPage(prompt);
          const imageBuffer = await fetchImage(result.imageUrl);
          const processedBuffer = await processImageForColoring(imageBuffer);

          const url = isS3Configured()
            ? await uploadImage(processedBuffer)
            : bufferToDataUrl(processedBuffer);

          return url;
        } catch (error) {
          console.error(`Failed to generate page for prompt: ${prompt}`, error);
          return null;
        }
      });

      const results = await Promise.all(batchPromises);
      pageUrls.push(...results.filter((url): url is string => url !== null));

      // Small delay between batches
      if (i + batchSize < prompts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // In production, combine into a PDF
    // For now, return the individual page URLs
    const pdfUrl = pageUrls[0] || ""; // Placeholder

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
