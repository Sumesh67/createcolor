import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Sparkles, Printer, Mic, Apple } from "lucide-react";
import {
  THEMES,
  getTheme,
  SITE_URL,
  APP_STORE_URL,
  type ColoringTheme,
} from "@/lib/themes";

export const dynamicParams = false;

export function generateStaticParams() {
  return THEMES.map((t) => ({ theme: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { theme: string };
}): Metadata {
  const theme = getTheme(params.theme);
  if (!theme) return {};
  const title = `Free ${theme.name} Coloring Pages for Kids | CreateAndColor`;
  const url = `${SITE_URL}/coloring-pages/${theme.slug}`;
  return {
    title,
    description: theme.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: theme.description,
      url,
      type: "article",
      siteName: "CreateAndColor",
      images: theme.image ? [{ url: `${SITE_URL}${theme.image}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: theme.description,
    },
  };
}

function buildFaqs(theme: ColoringTheme) {
  const faqs = [
    {
      q: `Are these ${theme.name.toLowerCase()} coloring pages really free?`,
      a: `Yes. You can create and print ${theme.name.toLowerCase()} coloring pages for free. Just describe the page you want and print it at home.`,
    },
    {
      q: `How do I make my own ${theme.name.toLowerCase()} coloring page?`,
      a: `Type or say your idea, and CreateAndColor draws a printable black-and-white coloring page in seconds. Then print it on regular paper and start coloring.`,
    },
    {
      q: "Can I print them at home?",
      a: "Absolutely. Every page is made to print on standard letter or A4 paper from any home printer — no special supplies needed.",
    },
  ];
  if (theme.faqExtra) faqs.push(theme.faqExtra);
  return faqs;
}

export default function ThemePage({ params }: { params: { theme: string } }) {
  const theme = getTheme(params.theme);
  if (!theme) notFound();

  const faqs = buildFaqs(theme);
  const related = THEMES.filter((t) => t.slug !== theme.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Coloring Pages",
            item: `${SITE_URL}/coloring-pages`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${theme.name} Coloring Pages`,
            item: `${SITE_URL}/coloring-pages/${theme.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${theme.gradient}`}>
        <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/coloring-pages" className="hover:underline">
              Coloring Pages
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{theme.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-5xl mb-3">{theme.emoji}</div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Free {theme.name} Coloring Pages
                <span className="block text-gray-700 text-2xl md:text-3xl mt-1">
                  made in seconds
                </span>
              </h1>
              <p className="font-body text-gray-700 mt-4 text-lg">
                {theme.intro[0]}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-400 text-white font-display font-bold shadow-lg shadow-orange-200 hover:bg-orange-500 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Make a {theme.name} page
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

            <div className="relative aspect-square rounded-3xl bg-white shadow-card overflow-hidden flex items-center justify-center">
              {theme.image ? (
                <Image
                  src={theme.image}
                  alt={`${theme.name} coloring page printable for kids`}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="text-[8rem]">{theme.emoji}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body copy */}
      <section className="max-w-3xl mx-auto px-5 py-12">
        {theme.intro.slice(1).map((p, i) => (
          <p key={i} className="font-body text-gray-700 text-lg leading-relaxed mb-4">
            {p}
          </p>
        ))}

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4 my-10">
          {[
            { icon: Mic, t: "Say it or type it", d: "Pick an idea, speak it, or spin for a surprise." },
            { icon: Sparkles, t: "We draw it", d: "A printable coloring page appears in seconds." },
            { icon: Printer, t: "Print & color", d: "Print on any home printer and start coloring." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <Icon className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="font-display font-bold text-gray-800">{t}</h3>
              <p className="font-body text-sm text-gray-500 mt-1">{d}</p>
            </div>
          ))}
        </div>

        {/* Idea chips */}
        <h2 className="font-display text-2xl font-bold text-gray-900 mt-10 mb-4">
          {theme.name} coloring page ideas to try
        </h2>
        <div className="flex flex-wrap gap-2">
          {theme.ideas.map((idea) => (
            <span
              key={idea}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-body text-sm shadow-sm"
            >
              {idea}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-400 text-white font-display font-bold shadow-lg shadow-orange-200 hover:bg-orange-500 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Create your {theme.name.toLowerCase()} page free
          </Link>
        </div>

        {/* FAQ */}
        <h2 className="font-display text-2xl font-bold text-gray-900 mt-12 mb-4">
          {theme.name} coloring pages — FAQ
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-display font-semibold text-gray-800">{f.q}</h3>
              <p className="font-body text-gray-600 mt-2">{f.a}</p>
            </div>
          ))}
        </div>

        {/* Related themes (internal links) */}
        <h2 className="font-display text-2xl font-bold text-gray-900 mt-12 mb-4">
          More coloring pages kids love
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {related.map((t) => (
            <Link
              key={t.slug}
              href={`/coloring-pages/${t.slug}`}
              className={`rounded-2xl bg-gradient-to-br ${t.gradient} p-4 shadow-card hover:shadow-lg transition-shadow`}
            >
              <div className="text-3xl">{t.emoji}</div>
              <div className="font-display font-bold text-gray-800 mt-2 text-sm">
                {t.name} Coloring Pages
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
