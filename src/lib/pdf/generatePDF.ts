import { renderToBuffer } from "@react-pdf/renderer";
import { ColoringPagePDF } from "./ColoringPagePDF";
import React, { ReactElement } from "react";

interface GeneratePDFOptions {
  imageUrls: string[];
  layout?: "single" | "double" | "quad" | "mini";
  childName?: string;
  includeCover?: boolean;
}

export async function generatePDF(options: GeneratePDFOptions): Promise<Buffer> {
  const {
    imageUrls,
    layout = "single",
    childName,
    includeCover = true,
  } = options;

  const document = React.createElement(ColoringPagePDF, {
    imageUrls,
    layout,
    childName,
    includeСover: includeCover,
  }) as ReactElement;

  const buffer = await renderToBuffer(document);

  return Buffer.from(buffer);
}

export async function generateSinglePagePDF(imageUrl: string): Promise<Buffer> {
  return generatePDF({
    imageUrls: [imageUrl],
    layout: "single",
    includeCover: false,
  });
}

export async function generatePartyPackPDF(
  imageUrls: string[],
  layout: "single" | "double" | "quad" | "mini",
  childName?: string
): Promise<Buffer> {
  return generatePDF({
    imageUrls,
    layout,
    childName,
    includeCover: true,
  });
}
