"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Copy, Sparkles, Instagram, Pin, ArrowLeft, CheckCircle2, Download, MessageCircle } from "lucide-react";

type Platform = "Pinterest" | "Instagram" | "Facebook" | "Reddit";
type ThemeKey =
  | "dinosaurs"
  | "unicorns"
  | "space"
  | "rainyday"
  | "magiclens"
  | "teachers"
  | "roadtrip"
  | "animals"
  | "birthday"
  | "princess"
  | "trucks"
  | "holiday";

const APP_URL = "https://createandcolor.aivantageworks.com";

const THEMES: Record<ThemeKey, {
  label: string;
  pinterestTitle: string;
  pinterestDescription: string;
  instagramCaption: string;
  facebookCaption: string;
  redditTitle: string;
  redditBody: string;
  headline: string;
  subheadline: string;
  hashtags: string;
  colors: string;
}> = {
  dinosaurs: {
    label: "Dinosaurs",
    pinterestTitle: "Free Dinosaur Coloring Pages for Kids",
    pinterestDescription: "Need an easy activity for dinosaur-loving kids? CreateColor lets you turn fun ideas into printable coloring pages in seconds. Great for quiet time, homeschool breaks, or screen-free fun. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Need an easy win for a dinosaur-loving kid? 🦖\n\nCreateColor turns fun ideas into printable coloring pages in seconds. Great for quiet time, homeschool breaks, or screen-free fun.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#kidsactivities #dinosaurcoloringpages #printablesforkids #momlife #screenfreeactivities #createcolor",
    facebookCaption: "If your kid loves dinosaurs, this is an easy one. CreateColor lets you turn fun ideas into printable coloring pages in seconds. Great for quiet time, homeschool, or rainy-day fun.\n\nTry it here: https://createandcolor.aivantageworks.com",
    redditTitle: "What easy dinosaur activity actually keeps kids busy?",
    redditBody: "For parents/teachers — what dinosaur activity actually holds a kid’s attention for more than five minutes? Coloring pages seem to keep working here, especially when the theme is super specific. Curious what simple dinosaur activities have worked well for other people.",
    headline: "Free Dinosaur Coloring Pages",
    subheadline: "Make one in seconds",
    hashtags: "#coloringpages #dinosaurcoloringpages #kidsactivities #preschoolactivities #homeschoolideas #printableactivities #momlife #createcolor",
    colors: "from-lime-200 via-green-100 to-emerald-200",
  },
  unicorns: {
    label: "Unicorns",
    pinterestTitle: "Unicorn Coloring Pages Kids Will Love",
    pinterestDescription: "If your child loves unicorns, rainbows, and magical creatures, CreateColor makes it easy to create fresh printable coloring pages anytime. Fun, fast, and parent-friendly. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Unicorn kid? We got you 🦄\n\nCreateColor makes fresh printable unicorn coloring pages in seconds — fun, fast, and actually useful for parents.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#unicorncoloringpages #kidsactivities #printablesforkids #momlife #rainydayactivities #createcolor",
    facebookCaption: "If your child loves unicorns, rainbows, and magical creatures, CreateColor makes fresh printable coloring pages in seconds. Simple, fun, and parent-friendly.\n\nTry it here: https://createandcolor.aivantageworks.com",
    redditTitle: "What magical / imaginative activities do your kids never get tired of?",
    redditBody: "Curious what imaginative activities your kids keep coming back to. Unicorns, rainbows, dragons, silly made-up characters — the more specific the idea, the more fun it seems to be. Looking for simple creative ideas that don’t require a ton of prep.",
    headline: "Unicorn coloring pages in seconds",
    subheadline: "Printable fun for kids",
    hashtags: "#unicorncoloringpages #kidsactivities #printablecoloringpages #rainydayactivities #momhack #homeschoolfun #createcolor",
    colors: "from-pink-100 via-purple-100 to-fuchsia-200",
  },
  space: {
    label: "Space",
    pinterestTitle: "Space Coloring Pages for Kids",
    pinterestDescription: "Rocket ships, planets, astronauts, and silly space creatures — CreateColor helps you turn any idea into a printable coloring page for kids. Perfect for weekend fun and screen-free time. Try it free: https://createandcolor.aivantageworks.com",
    instagramCaption: "Rocket ships, planets, astronauts, silly aliens 🚀\n\nCreateColor helps you turn almost any space idea into a printable coloring page for kids.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#spacecoloringpages #kidsactivities #screenfreefun #printablesforkids #createcolor",
    facebookCaption: "Rocket ships, planets, astronauts, and silly space creatures — CreateColor turns almost any idea into a printable coloring page for kids. Perfect for weekend fun and screen-free time.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What space-themed activity works best for kids?",
    redditBody: "What’s been your best space-themed activity for kids lately? Rockets, astronauts, planets, aliens — anything that reliably gets them excited. Looking for simple ideas parents or teachers can use without a huge setup.",
    headline: "Space coloring pages kids can imagine",
    subheadline: "Turn any idea into a printable page",
    hashtags: "#spacecoloringpages #kidsactivities #printablesforkids #weekendactivities #screenfreeactivities #createcolor",
    colors: "from-sky-100 via-indigo-100 to-cyan-200",
  },
  rainyday: {
    label: "Rainy Day",
    pinterestTitle: "Easy Rainy Day Activity for Kids",
    pinterestDescription: "Stuck inside with bored kids? CreateColor makes printable coloring pages from almost any idea in seconds. A simple rainy-day activity parents can use again and again. https://createandcolor.aivantageworks.com",
    instagramCaption: "Rainy day + bored kid + low-energy parent = rough combo 😅\n\nCreateColor turns almost any idea into a printable coloring page in seconds. Simple, free, and actually useful.\n\nhttps://createandcolor.aivantageworks.com\n\n#rainydayactivities #kidsactivities #momlife #screenfreefun #createcolor",
    facebookCaption: "Stuck inside with bored kids? CreateColor makes printable coloring pages from almost any idea in seconds. It’s a simple rainy-day activity parents can use again and again.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What’s your best low-effort rainy day activity for kids?",
    redditBody: "What’s your best rainy day activity when kids are stuck inside and your energy is low? Coloring pages are one of the few things that still reliably buy me a little quiet time 😅 Looking for other simple wins too.",
    headline: "Rainy day? Print this.",
    subheadline: "Easy kid activity in seconds",
    hashtags: "#rainydayactivities #kidsactivities #momlife #printablesforkids #screenfreefun #parentinghacks #createcolor",
    colors: "from-blue-100 via-cyan-50 to-slate-100",
  },
  magiclens: {
    label: "Magic Lens",
    pinterestTitle: "Turn Photos Into Coloring Pages",
    pinterestDescription: "Take a photo and turn it into a printable coloring page with Magic Lens. A fun way to turn favorite toys, pets, and everyday moments into creative kid activities. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Take a photo. Make a coloring page. 📸✨\n\nMagic Lens turns real things into printable fun — toys, pets, favorite objects, random kid obsessions.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#magiclens #kidsactivities #coloringpages #screenfreeactivities #createcolor",
    facebookCaption: "One of the coolest parts of CreateColor is Magic Lens. Take a photo and turn it into a coloring page. Toys, pets, favorite objects — all fair game.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "Would your kids use a photo-to-coloring-page feature?",
    redditBody: "Curious if other parents think their kids would enjoy turning real things into coloring pages — like a favorite toy, pet, or random object they’re obsessed with this week. It seems like a fun way to make activities feel more personal.",
    headline: "Take a photo. Make a coloring page.",
    subheadline: "Magic Lens turns real things into printable fun",
    hashtags: "#magiclens #kidsactivities #coloringpages #parenting #screenfreeactivities #createcolor",
    colors: "from-amber-100 via-orange-50 to-pink-100",
  },
  teachers: {
    label: "Teachers & Homeschool",
    pinterestTitle: "Custom Coloring Pages for Homeschool & Classrooms",
    pinterestDescription: "Parents, teachers, and homeschoolers can create printable coloring pages based on exactly what kids are learning or already love. Fast, flexible, and fun. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Parents, teachers, and homeschoolers: custom coloring pages are such an easy way to match what kids are already learning or loving this week.\n\nTry CreateColor free: https://createandcolor.aivantageworks.com\n\n#homeschoolideas #teacherlife #preschoolactivities #kidsprintables #createcolor",
    facebookCaption: "If you’re a parent, teacher, or homeschooler, custom coloring pages are such an easy way to match what kids are already learning. Animals, letters, space, seasons, silly prompts — whatever fits.\n\nTry it here: https://createandcolor.aivantageworks.com",
    redditTitle: "Do you use custom printables or mostly pre-made ones?",
    redditBody: "For parents/teachers/homeschoolers — do you mostly use pre-made printables, or do you ever wish you could generate exactly what a kid is into that day? The more specific the theme, the more engaged kids seem to be.",
    headline: "Custom coloring pages for what kids already love",
    subheadline: "Great for parents, teachers, and homeschoolers",
    hashtags: "#homeschoolideas #teacherlife #preschoolactivities #kindergartenactivities #kidsprintables #learningthroughplay #createcolor",
    colors: "from-yellow-100 via-lime-50 to-green-100",
  },
  roadtrip: {
    label: "Road Trip",
    pinterestTitle: "Road Trip Activity for Kids",
    pinterestDescription: "Need an easy road trip activity? CreateColor helps parents make fresh printable coloring pages before heading out. Great for car rides, waiting rooms, restaurants, and travel days. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Need a quick road trip activity for kids? 🚗\n\nCreateColor helps you make fresh printable coloring pages before you head out. Great for car rides, waiting rooms, and restaurant survival.\n\nhttps://createandcolor.aivantageworks.com\n\n#roadtripwithkids #travelactivitiesforkids #kidsprintables #createcolor",
    facebookCaption: "Need an easy road trip activity? CreateColor helps parents make fresh printable coloring pages before heading out. Great for car rides, waiting rooms, restaurants, and travel days.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "Best road trip activity that isn’t another screen?",
    redditBody: "What’s your best road trip activity for kids that doesn’t involve another screen? Looking for easy printable or low-prep ideas that work in the car, waiting rooms, or restaurants.",
    headline: "Road trip activity in 10 seconds",
    subheadline: "Print before you go",
    hashtags: "#roadtripwithkids #travelactivitiesforkids #kidsprintables #coloringpages #momlife #createcolor",
    colors: "from-orange-100 via-yellow-50 to-amber-100",
  },
  animals: {
    label: "Animals",
    pinterestTitle: "Cute Animal Coloring Pages for Kids",
    pinterestDescription: "From puppies and kittens to jungle animals and sea creatures, CreateColor helps you make printable animal coloring pages in seconds. Great for preschool, quiet time, or screen-free fun. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Animal-loving kid? 🐶🐱🦁\n\nCreateColor makes printable animal coloring pages in seconds — from pets to jungle animals to sea creatures.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#animalcoloringpages #kidsactivities #printablesforkids #createcolor",
    facebookCaption: "From puppies and kittens to jungle animals and sea creatures, CreateColor helps you make printable animal coloring pages in seconds.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What animal theme do kids never get bored of?",
    redditBody: "If you’ve done a lot of kid activities, what animal theme do kids seem to never get tired of? Pets, dinosaurs, jungle animals, sea creatures? Curious what consistently works.",
    headline: "Animal coloring pages in seconds",
    subheadline: "Pets, jungle animals, sea creatures, and more",
    hashtags: "#animalcoloringpages #kidsactivities #preschoolactivities #printablesforkids #createcolor",
    colors: "from-emerald-100 via-lime-50 to-yellow-100",
  },
  birthday: {
    label: "Birthday Party",
    pinterestTitle: "Birthday Party Coloring Pages for Kids",
    pinterestDescription: "Need an easy birthday party activity? CreateColor helps you make themed printable coloring pages in seconds for parties, classrooms, or family celebrations. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Need a quick birthday party activity? 🎉\n\nCreateColor makes themed printable coloring pages in seconds — perfect for party tables, classrooms, or take-home fun.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#birthdaypartyideas #kidsactivities #printablesforkids #createcolor",
    facebookCaption: "Need an easy birthday party activity? CreateColor helps you make themed printable coloring pages in seconds for parties, classrooms, or family celebrations.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What’s a simple birthday party activity that actually works?",
    redditBody: "Looking for low-stress birthday party activity ideas for younger kids. Something simple, cheap, and easy to set up — bonus if it works for different ages at once. What’s worked well for you?",
    headline: "Birthday party activity in minutes",
    subheadline: "Print custom coloring pages fast",
    hashtags: "#birthdaypartyideas #kidsactivities #partyprintables #momlife #createcolor",
    colors: "from-pink-100 via-yellow-50 to-purple-100",
  },
  princess: {
    label: "Princess",
    pinterestTitle: "Princess Coloring Pages for Kids",
    pinterestDescription: "Crowns, castles, dresses, magical animals — CreateColor makes princess-themed printable coloring pages in seconds. Fun for little imaginations and easy for parents. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Princess kid? 👑\n\nCreateColor makes princess-themed printable coloring pages in seconds — crowns, castles, magical animals, and more.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#princesscoloringpages #kidsactivities #printablesforkids #createcolor",
    facebookCaption: "Crowns, castles, dresses, magical animals — CreateColor makes princess-themed printable coloring pages in seconds.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What princess/fantasy activity actually keeps kids engaged?",
    redditBody: "What princess or fantasy-themed activities have worked well for your kids? Looking for simple ideas that feel imaginative without a ton of prep.",
    headline: "Princess coloring pages in seconds",
    subheadline: "Crowns, castles, and magical fun",
    hashtags: "#princesscoloringpages #kidsactivities #fantasyforkids #printablesforkids #createcolor",
    colors: "from-rose-100 via-fuchsia-50 to-violet-100",
  },
  trucks: {
    label: "Trucks & Cars",
    pinterestTitle: "Truck Coloring Pages for Kids",
    pinterestDescription: "Monster trucks, fire trucks, dump trucks, race cars — CreateColor makes vehicle-themed printable coloring pages in seconds. Great for truck-loving kids. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Truck kid? 🚚🏎️\n\nCreateColor makes printable truck and car coloring pages in seconds — monster trucks, race cars, fire trucks, and more.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#truckcoloringpages #kidsactivities #printablesforkids #createcolor",
    facebookCaption: "Monster trucks, fire trucks, dump trucks, race cars — CreateColor makes vehicle-themed printable coloring pages in seconds.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What vehicle-themed kid activity actually works well?",
    redditBody: "For truck/car obsessed kids: what activity do they actually stay interested in? Looking for simple ideas that are easy for parents or teachers to use.",
    headline: "Truck coloring pages in seconds",
    subheadline: "Monster trucks, race cars, and more",
    hashtags: "#truckcoloringpages #kidsactivities #vehicleactivities #printablesforkids #createcolor",
    colors: "from-slate-100 via-blue-50 to-sky-100",
  },
  holiday: {
    label: "Holiday",
    pinterestTitle: "Holiday Coloring Pages for Kids",
    pinterestDescription: "Need an easy seasonal activity? CreateColor helps you make holiday-themed printable coloring pages in seconds for classrooms, family fun, and festive quiet time. Try it here: https://createandcolor.aivantageworks.com",
    instagramCaption: "Need a quick holiday activity for kids? 🎄🎃🐣\n\nCreateColor helps you make festive printable coloring pages in seconds for whatever season you’re in.\n\nTry it free: https://createandcolor.aivantageworks.com\n\n#holidayactivities #kidsactivities #printablesforkids #createcolor",
    facebookCaption: "Need an easy seasonal activity? CreateColor helps you make holiday-themed printable coloring pages in seconds for classrooms, family fun, and festive quiet time.\n\nhttps://createandcolor.aivantageworks.com",
    redditTitle: "What’s your favorite easy holiday activity for kids?",
    redditBody: "What’s your favorite low-prep holiday activity for kids? Looking for simple things that feel festive without turning into a huge project.",
    headline: "Holiday coloring pages in seconds",
    subheadline: "Fast festive fun for kids",
    hashtags: "#holidayactivities #kidsactivities #seasonalprintables #momlife #createcolor",
    colors: "from-red-100 via-yellow-50 to-green-100",
  },
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button variant={copied ? "secondary" : "outline"} size="sm" onClick={handleCopy}>
      {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export default function MarketingPage() {
  const [platform, setPlatform] = useState<Platform>("Pinterest");
  const [theme, setTheme] = useState<ThemeKey>("dinosaurs");

  const content = THEMES[theme];

  let mainCopy = content.pinterestDescription;
  if (platform === "Instagram") mainCopy = content.instagramCaption;
  else if (platform === "Facebook") mainCopy = content.facebookCaption;
  else if (platform === "Reddit") mainCopy = content.redditBody;

  let title = content.pinterestTitle;
  if (platform === "Reddit") title = content.redditTitle;
  else if (platform !== "Pinterest") title = content.headline;

  const pinTextBlock = `${content.pinterestTitle}\n\n${content.headline}\n${content.subheadline}\n\n${content.pinterestDescription}\n\n${content.hashtags}`;

  const fullExport = `CreateColor Marketing Pack\nTheme: ${content.label}\nPlatform: ${platform}\n\nTitle:\n${title}\n\nMain Copy:\n${mainCopy}\n\nImage Hook:\n${content.headline}\n${content.subheadline}\n\nHashtags:\n${content.hashtags}\n\nLink:\n${APP_URL}`;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex gap-3 flex-wrap">
            <Button variant="accent" onClick={() => downloadTextFile(`createcolor-${theme}-${platform.toLowerCase()}.txt`, fullExport)}>
              <Download className="w-4 h-4 mr-2" /> Export Text Pack
            </Button>
            <Link href="/create">
              <Button variant="primary">
                <Sparkles className="w-4 h-4 mr-2" /> Open CreateColor
              </Button>
            </Link>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            CreateColor <span className="text-primary">Marketing Studio</span> 📌
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Generate Pinterest pins, Instagram captions, Facebook posts, Reddit prompts, and downloadable marketing text in seconds.
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm text-foreground/70 shadow-sm">
            <span><strong>Platform:</strong> {platform}</span>
            <span className="text-foreground/30">•</span>
            <span><strong>Theme:</strong> {content.label}</span>
          </div>
        </motion.div>

        <div className="mb-6 rounded-2xl bg-white border border-border p-4 shadow-sm">
          <div className="text-sm font-semibold text-foreground mb-3">Quick presets</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setPlatform("Pinterest"); setTheme("dinosaurs"); }} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Pinterest + Dinosaurs</button>
            <button onClick={() => { setPlatform("Instagram"); setTheme("magiclens"); }} className="px-3 py-2 rounded-xl bg-secondary text-white text-sm font-semibold">Instagram + Magic Lens</button>
            <button onClick={() => { setPlatform("Facebook"); setTheme("rainyday"); }} className="px-3 py-2 rounded-xl bg-accent text-foreground text-sm font-semibold">Facebook + Rainy Day</button>
            <button onClick={() => { setPlatform("Reddit"); setTheme("teachers"); }} className="px-3 py-2 rounded-xl border border-border bg-white text-sm font-semibold">Reddit + Teachers</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold mb-3">Choose Platform</h2>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Pinterest">Pinterest</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Reddit">Reddit</option>
                </select>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold mb-3">Choose Theme</h2>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeKey)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                    <option key={key} value={key}>{THEMES[key].label}</option>
                  ))}
                </select>
                <div className="mt-3 grid gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`w-full text-left rounded-xl px-4 py-2 border text-sm transition-all ${
                        theme === key
                          ? "bg-secondary text-white border-secondary shadow-sm"
                          : "bg-white border-border hover:border-secondary/40"
                      }`}
                    >
                      <span className="font-semibold">{THEMES[key].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`rounded-[28px] border border-white/60 bg-gradient-to-br ${content.colors} p-6 shadow-sm min-h-[260px] flex flex-col justify-between`}>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Preview Card</div>
                  <h3 className="font-display text-3xl font-bold text-slate-900 leading-tight">{content.headline}</h3>
                  <p className="text-slate-700 mt-3 text-lg leading-relaxed">{content.subheadline}</p>
                </div>
                <div className="pt-6 text-sm font-semibold text-slate-600">createandcolor.aivantageworks.com</div>
              </div>

              <div className="rounded-[28px] border border-dashed border-primary/30 bg-white p-6 shadow-sm min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4">Pin Text Block</div>
                  <p className="font-display text-2xl font-bold text-foreground leading-tight">{content.pinterestTitle}</p>
                  <p className="text-foreground/70 mt-3">{content.headline}</p>
                  <p className="text-foreground/60 mt-1">{content.subheadline}</p>
                </div>
                <div className="flex gap-2 flex-wrap pt-4">
                  <CopyButton label="Copy Pin Text" text={pinTextBlock} />
                  <Button variant="outline" size="sm" onClick={() => downloadTextFile(`createcolor-${theme}-pin-text.txt`, pinTextBlock)}>
                    <Download className="w-4 h-4 mr-2" /> Download Pin Text
                  </Button>
                </div>
              </div>
            </div>

            <Card hover>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm text-foreground/50 font-medium">Generated {platform} Content</div>
                    <h2 className="font-display text-2xl font-bold">{content.label}</h2>
                  </div>
                  <CopyButton label="Copy Main Copy" text={mainCopy} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-primary font-bold mb-2">
                      {platform === "Pinterest" ? "Pin Title" : platform === "Reddit" ? "Reddit Title" : "Headline"}
                    </div>
                    <p className="font-display text-xl font-bold text-foreground">{title}</p>
                    <div className="mt-3">
                      <CopyButton label="Copy Title" text={title} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-secondary/5 border border-secondary/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-secondary font-bold mb-2">Image Hook</div>
                    <p className="font-display text-xl font-bold text-foreground">{content.headline}</p>
                    <p className="text-foreground/70 mt-1">{content.subheadline}</p>
                    <div className="mt-3">
                      <CopyButton label="Copy Image Text" text={`${content.headline}\n${content.subheadline}`} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-border p-5">
                  <div className="text-xs uppercase tracking-wide text-foreground/50 font-bold mb-3">
                    {platform === "Pinterest" ? "Pin Description" : platform === "Reddit" ? "Reddit Body" : `${platform} Caption`}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-foreground/80 font-body leading-7">{mainCopy}</pre>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-accent/10 border border-accent/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-foreground/50 font-bold mb-2">Hashtags</div>
                    <p className="text-sm text-foreground/80 leading-7">{content.hashtags}</p>
                    <div className="mt-3">
                      <CopyButton label="Copy Hashtags" text={content.hashtags} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                    <div className="text-xs uppercase tracking-wide text-foreground/50 font-bold mb-2">CTA Link</div>
                    <p className="text-sm text-foreground/80 break-all">{APP_URL}</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <CopyButton label="Copy Link" text={APP_URL} />
                      <Button variant="outline" size="sm" onClick={() => downloadTextFile(`createcolor-${theme}-${platform.toLowerCase()}-full-pack.txt`, fullExport)}>
                        <Download className="w-4 h-4 mr-2" /> Download Pack
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-display text-xl font-bold mb-3">How to use this fast</h3>
                <ol className="space-y-2 text-foreground/70 list-decimal list-inside">
                  <li>Choose a platform</li>
                  <li>Pick a theme kids actually love</li>
                  <li>Copy the title, caption, Reddit prompt, or image text</li>
                  <li>Use the preview card as your design direction</li>
                  <li>Download the text pack if you want to batch-create content later</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
