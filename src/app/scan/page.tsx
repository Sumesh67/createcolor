import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Own Coloring Pages | CreateAndColor",
  description: "Turn any idea into a magical coloring page in seconds. Free for kids and teachers!",
};

const FROM_LABELS: Record<string, string> = {
  worksheet: "your teacher's worksheet",
  party: "your party pack",
  storybook: "your storybook",
  coloring: "your coloring page",
};

interface ScanPageProps {
  searchParams: Promise<{ from?: string; utm_campaign?: string }>;
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const params = await searchParams;
  const from = params.from ?? "coloring";
  const sourceLabel = FROM_LABELS[from] ?? "your coloring page";

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Hero icon */}
        <div className="text-8xl leading-none select-none">🎨</div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
            You scanned {sourceLabel}!
          </h1>
          <p className="text-lg text-gray-600">
            Now make <span className="font-semibold text-orange-500">your own</span> magical coloring
            pages, worksheets, party packs, and storybooks — completely free.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            { emoji: "🖍️", title: "Coloring Pages", desc: "Type any idea and watch it come alive" },
            { emoji: "📝", title: "Worksheets", desc: "Custom sheets for any grade & topic" },
            { emoji: "🎉", title: "Party Packs", desc: "Up to 20 pages in one click" },
            { emoji: "📖", title: "Storybooks", desc: "Your characters, your adventure" },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-semibold text-gray-800 text-sm">{title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <Link
          href="/create"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg transition-colors"
        >
          Start Creating for Free →
        </Link>

        <p className="text-xs text-gray-400">
          No sign-up required · Works on any device
        </p>
      </div>
    </main>
  );
}
