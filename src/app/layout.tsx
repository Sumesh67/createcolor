import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Free Coloring Pages for Kids | AI Coloring Book Generator | CreateAndColor",
  description: "Create free coloring pages for kids with AI! Turn voice to image for children, generate printable kids activities instantly. The best AI coloring book maker - just speak, spin, or type to create custom coloring pages.",
  keywords: [
    "free coloring pages for kids",
    "AI coloring book",
    "printable kids activities",
    "voice to image for children",
    "coloring pages generator",
    "custom coloring pages",
    "kids coloring book online",
    "AI coloring page maker",
    "free printable coloring pages",
    "coloring activities for children",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Create and Color",
  },
  openGraph: {
    title: "Free Coloring Pages for Kids | AI Coloring Book Generator",
    description: "Create free coloring pages for kids with AI! Turn voice to image, generate printable kids activities instantly.",
    type: "website",
    locale: "en_US",
    siteName: "CreateAndColor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Coloring Pages for Kids | AI Coloring Book Generator",
    description: "Create free coloring pages for kids with AI! Turn voice to image, generate printable kids activities instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${nunito.variable} font-body antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
