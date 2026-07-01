import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Apple } from "lucide-react";
import { THEMES, SITE_URL, APP_STORE_URL } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Free Printable Coloring Pages for Kids | CreateAndColor",
  description:
    "Browse free printable coloring pages for kids — dinosaurs, unicorns, space, animals, and more. Or type any idea and make your own custom page in seconds.",
  alternates: { canonical: `${SITE_URL}/coloring-pages` },
  openGraph: {
    title: "Free Printable Coloring Pages for Kids | CreateAndColor",
    description:
      "Browse free printable coloring pages for kids, or type any idea and make your own custom page in seconds.",
    url: `${SITE_URL}/coloring-pages`,
    type: "website",
    siteName: "CreateAndColor",
  },
};

export default function ColoringPagesHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Printable Coloring Pages for Kids",
    url: `${SITE_URL}/coloring-pages`,
    hasPart: THEMES.map((t) => ({
      "@type": "WebPage",
      name: `${t.name} Coloring Pages`,
      url: `${SITE_URL}/coloring-pages/${t.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-gradient-to-br from-orange-100 via-amber-50 to-pink-100">
        <div className="max-w-5xl mx-auto px-5 py-14 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Free Printable Coloring Pages for Kids
          </h1>
          <p className="font-body text-gray-700 mt-4 text-lg max-w-2xl mx-auto">
            Pick a theme below — or skip the search entirely and type any idea
            you can dream up. CreateAndColor draws a printable coloring page in
            seconds. If a kid can imagine it, they can color it.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-7">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-400 text-white font-display font-bold shadow-lg shadow-orange-200 hover:bg-orange-500 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Make your own page free
            </Link>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white font-display font-bold shadow-lg hover:bg-black transition-colors"
            >
              <Apple className="w-5 h-5" />
              Get the free app
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
          Browse by theme
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {THEMES.map((t) => (
            <Link
              key={t.slug}
              href={`/coloring-pages/${t.slug}`}
              className={`rounded-3xl bg-gradient-to-br ${t.gradient} p-5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              <div className="text-4xl">{t.emoji}</div>
              <div className="font-display font-bold text-gray-800 mt-3">
                {t.name} Coloring Pages
              </div>
              <div className="font-body text-xs text-gray-600 mt-1">
                Make one in seconds →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Can&apos;t find the theme you want?
          </h2>
          <p className="font-body text-gray-600 mt-2 max-w-xl mx-auto">
            That&apos;s the whole point — CreateAndColor isn&apos;t a fixed set
            of printables. Type or say literally any idea and get a brand-new
            printable coloring page in seconds.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-400 text-white font-display font-bold shadow-lg shadow-orange-200 hover:bg-orange-500 transition-colors mt-5"
          >
            <Sparkles className="w-5 h-5" />
            Start creating free
          </Link>
        </div>
      </section>
    </div>
  );
}
