import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Providers } from "@/components/Providers";
import { TopHeader } from "@/components/layout/TopHeader";
import { MobileNav } from "@/components/layout/MobileNav";
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
  verification: {
    google: "3trIam-AUiTD_dTLgRbKfdsqxfahSNEmNjvogj19QO4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://createandcolor.aivantageworks.com";

  // Structured data so search engines and LLMs (ChatGPT, Claude, Perplexity,
  // Google AI Overviews) understand and can recommend the product.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "CreateAndColor",
        url: siteUrl,
        logo: `${siteUrl}/icon-512.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "CreateAndColor",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "CreateAndColor",
        operatingSystem: "iOS, Web",
        applicationCategory: "EducationalApplication",
        url: siteUrl,
        installUrl: "https://apps.apple.com/app/id6760249757",
        description:
          "Free AI coloring page generator for kids. Type, say, or spin any idea and get a printable coloring page in seconds. Great for parents, teachers, and homeschoolers.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Turn any idea into a printable coloring page in seconds",
          "Voice input so young kids can create on their own",
          "Magic Lens: turn a photo into a coloring page",
          "Party Pack: 20 custom coloring pages at once",
          "Print as PDF and share",
          "Safe, kid-friendly, ad-free",
        ],
        audience: {
          "@type": "Audience",
          audienceType:
            "Parents, teachers, and homeschoolers of kids ages 2-10",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${nunito.variable} font-body antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <TopHeader />
          <main className="pt-14 pb-16 md:pb-0">
            {children}
          </main>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
