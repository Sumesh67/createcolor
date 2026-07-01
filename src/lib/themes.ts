// Public SEO theme data for /coloring-pages/[theme] landing pages.
// These pages are pre-rendered and reuse pre-generated sample images, so they
// cost nothing to serve and rank for "[theme] coloring pages" searches.

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://createandcolor.aivantageworks.com";

export const APP_STORE_URL = "https://apps.apple.com/app/id6760249757";

export type ColoringTheme = {
  slug: string;
  name: string; // singular, e.g. "Dinosaur"
  emoji: string;
  gradient: string; // tailwind gradient classes for the hero/placeholder
  description: string; // meta description (<160 chars ideal)
  intro: string[]; // on-page paragraphs
  ideas: string[]; // sample prompt ideas shown as chips
  image?: string; // pre-generated sample under /public
  faqExtra?: { q: string; a: string };
};

export const THEMES: ColoringTheme[] = [
  {
    slug: "dinosaur",
    name: "Dinosaur",
    emoji: "🦖",
    gradient: "from-lime-200 via-green-100 to-emerald-200",
    description:
      "Free printable dinosaur coloring pages for kids. Type any idea — a T-Rex on a skateboard — and get a printable page in seconds. No prep, no searching.",
    intro: [
      "Got a dinosaur-obsessed kid? Instead of hunting for the right printable, just describe the dinosaur you want and CreateAndColor draws a printable coloring page in seconds — a friendly Triceratops, a roaring T-Rex, or a silly dino eating pizza.",
      "Every page is brand new, so kids never color the same one twice. It's a perfect screen-free activity for quiet time, homeschool breaks, road trips, or a dinosaur-themed birthday party.",
    ],
    ideas: [
      "A T-Rex riding a skateboard",
      "A friendly Triceratops in a meadow",
      "A baby dinosaur hatching from an egg",
      "A Stegosaurus eating leaves",
      "A dinosaur wearing a party hat",
      "A flying Pteranodon over volcanoes",
    ],
    image: "/gallery/dinosaur.png",
    faqExtra: {
      q: "What dinosaurs can I make coloring pages of?",
      a: "Any of them — T-Rex, Triceratops, Stegosaurus, Velociraptor, Brachiosaurus, Pteranodon, or even made-up friendly dinos. Just type or say the idea and a printable page appears in seconds.",
    },
  },
  {
    slug: "unicorn",
    name: "Unicorn",
    emoji: "🦄",
    gradient: "from-pink-100 via-purple-100 to-fuchsia-200",
    description:
      "Free printable unicorn coloring pages for kids. Make magical unicorns, rainbows, and castles in seconds — fresh pages every time, parent-friendly and fun.",
    intro: [
      "If your child loves unicorns, rainbows, and magical creatures, CreateAndColor makes fresh printable unicorn coloring pages anytime. Describe the magic — a unicorn flying over a rainbow, a baby unicorn in a flower field — and get a printable page in seconds.",
      "No more digging through the same old printables. Every page is unique, so the magic never runs out. Great for quiet time, sleepovers, rainy days, and birthday parties.",
    ],
    ideas: [
      "A unicorn flying over a rainbow",
      "A baby unicorn in a flower field",
      "A unicorn with a magical castle",
      "A unicorn mermaid under the sea",
      "A sparkly unicorn with butterfly wings",
      "A unicorn family at a tea party",
    ],
    image: "/gallery/unicorn.png",
  },
  {
    slug: "space",
    name: "Space",
    emoji: "🚀",
    gradient: "from-sky-100 via-indigo-100 to-cyan-200",
    description:
      "Free printable space coloring pages for kids. Rockets, planets, astronauts, and silly aliens — turn any space idea into a printable coloring page in seconds.",
    intro: [
      "Rocket ships, planets, astronauts, and silly space creatures — CreateAndColor turns almost any space idea into a printable coloring page for kids. Just describe it and watch it appear in seconds.",
      "It's an easy way to mix learning and play: make pages of the solar system, a Mars rover, or a cat astronaut floating in space. Perfect for weekend fun, screen-free time, and curious little explorers.",
    ],
    ideas: [
      "An astronaut floating in space",
      "A rocket ship blasting off",
      "A friendly alien waving hello",
      "The planets of the solar system",
      "A cat astronaut on the moon",
      "A space station orbiting Earth",
    ],
    image: "/gallery/rocket.png",
  },
  {
    slug: "animals",
    name: "Animal",
    emoji: "🐾",
    gradient: "from-emerald-100 via-lime-50 to-yellow-100",
    description:
      "Free printable animal coloring pages for kids. Puppies, kittens, jungle animals, and sea creatures — made in seconds, fresh every time. Great for preschool.",
    intro: [
      "From puppies and kittens to jungle animals and sea creatures, CreateAndColor makes printable animal coloring pages in seconds. Just name the animal — a fluffy puppy, a lion cub, a sea turtle — and a printable page appears.",
      "It's a favorite for preschool, quiet time, and screen-free fun, and a gentle way to help little ones learn animal names while they color.",
    ],
    ideas: [
      "A fluffy puppy playing with a ball",
      "A lion cub in the jungle",
      "A sea turtle swimming",
      "A panda eating bamboo",
      "A family of penguins",
      "A kitten chasing a butterfly",
    ],
    image: "/gallery/puppy.png",
  },
  {
    slug: "mermaid",
    name: "Mermaid",
    emoji: "🧜‍♀️",
    gradient: "from-cyan-100 via-teal-50 to-blue-100",
    description:
      "Free printable mermaid coloring pages for kids. Under-the-sea mermaids, dolphins, and treasure — turn any ocean idea into a printable page in seconds.",
    intro: [
      "Dive under the sea with printable mermaid coloring pages made in seconds. Describe the scene — a mermaid riding a dolphin, a mermaid castle full of treasure — and CreateAndColor draws it for you.",
      "Every ocean adventure is unique, so there's always a new page to color. Perfect for bath-loving, sea-obsessed kids on rainy days and quiet afternoons.",
    ],
    ideas: [
      "A mermaid riding a dolphin",
      "A mermaid castle under the sea",
      "A mermaid with a treasure chest",
      "A mermaid and a friendly whale",
      "A mermaid swimming with seahorses",
      "A baby mermaid in a seashell",
    ],
    image: "/gallery/mermaid.png",
  },
  {
    slug: "robot",
    name: "Robot",
    emoji: "🤖",
    gradient: "from-slate-100 via-zinc-50 to-sky-100",
    description:
      "Free printable robot coloring pages for kids. Friendly robots, space bots, and silly machines — turn any robot idea into a printable coloring page in seconds.",
    intro: [
      "Beep boop! CreateAndColor turns any robot idea into a printable coloring page in seconds — a friendly helper robot, a giant battle bot, or a tiny robot pet. Just describe it and print.",
      "It's a hit with kids who love machines, building, and a bit of sci-fi. Great for screen-free play, STEM-themed activities, and quiet time.",
    ],
    ideas: [
      "A friendly robot waving hello",
      "A robot dinosaur with rockets",
      "A tiny robot pet dog",
      "A giant robot in a city",
      "A robot chef cooking pancakes",
      "A robot playing soccer",
    ],
    image: "/gallery/robot.png",
  },
  {
    slug: "princess",
    name: "Princess",
    emoji: "👑",
    gradient: "from-rose-100 via-fuchsia-50 to-violet-100",
    image: "/gallery/princess.png",
    description:
      "Free printable princess coloring pages for kids. Crowns, castles, dresses, and magical animals — made in seconds, fresh every time. Easy for parents.",
    intro: [
      "Crowns, castles, dresses, and magical animals — CreateAndColor makes princess-themed printable coloring pages in seconds. Describe the royal scene and a brand-new page appears, ready to print.",
      "Perfect for little imaginations and easy for parents: no searching, no prep, and a new princess adventure every single time.",
    ],
    ideas: [
      "A princess in front of her castle",
      "A princess riding a unicorn",
      "A princess with a magic wand",
      "A princess and a friendly dragon",
      "A princess at a royal tea party",
      "A princess in a beautiful garden",
    ],
  },
  {
    slug: "trucks-and-cars",
    name: "Truck & Car",
    emoji: "🚚",
    gradient: "from-slate-100 via-blue-50 to-sky-100",
    image: "/gallery/trucks.png",
    description:
      "Free printable truck and car coloring pages for kids. Monster trucks, fire trucks, race cars, and diggers — turn any vehicle idea into a page in seconds.",
    intro: [
      "Monster trucks, fire trucks, dump trucks, and race cars — CreateAndColor makes vehicle-themed printable coloring pages in seconds. Just name the truck and watch it appear, ready to print.",
      "It's perfect for truck-loving toddlers and preschoolers, with a fresh ride to color every time. Great for quiet time, waiting rooms, and rainy days.",
    ],
    ideas: [
      "A giant monster truck",
      "A fire truck racing to a fire",
      "A digger at a construction site",
      "A race car on a track",
      "A garbage truck on its route",
      "A tractor on a farm",
    ],
  },
  {
    slug: "birthday-party",
    name: "Birthday Party",
    emoji: "🎉",
    gradient: "from-pink-100 via-yellow-50 to-purple-100",
    image: "/gallery/birthday.png",
    description:
      "Free printable birthday party coloring pages and activities for kids. Make themed pages in seconds — or a Party Pack of 20 — for parties and classrooms.",
    intro: [
      "Need an easy birthday party activity? CreateAndColor makes themed printable coloring pages in seconds for parties, classrooms, and family celebrations. Match the birthday theme exactly — dinosaurs, unicorns, superheroes — and print.",
      "Want a whole set? The Party Pack creates 20 custom coloring pages at once, so every little guest gets their own. It's the no-stress activity that keeps kids happily busy.",
    ],
    ideas: [
      "A birthday cake with candles",
      "Balloons and party hats",
      "A dinosaur birthday party",
      "A unicorn birthday cake",
      "A pile of wrapped presents",
      "Friends at a party with streamers",
    ],
    faqExtra: {
      q: "Can I make a set of pages for a party?",
      a: "Yes! The Party Pack feature creates 20 custom coloring pages at once around your party theme, so every guest gets their own page to color.",
    },
  },
  {
    slug: "rainy-day",
    name: "Rainy Day Activity",
    emoji: "🌧️",
    gradient: "from-blue-100 via-cyan-50 to-slate-100",
    image: "/gallery/rainyday.png",
    description:
      "Free printable rainy day coloring pages and activities for kids. Stuck inside with bored kids? Make a printable page from almost any idea in seconds.",
    intro: [
      "Stuck inside with bored kids? CreateAndColor makes printable coloring pages from almost any idea in seconds — a cozy rainy-day activity you can reach for again and again.",
      "Let kids pick the idea, print it, and color. It's an instant, screen-free way to turn a long indoor afternoon into something fun and calm.",
    ],
    ideas: [
      "A cozy house in the rain",
      "Kids jumping in puddles",
      "A rainbow after the storm",
      "A snail with an umbrella",
      "A blanket fort adventure",
      "Ducks splashing in a pond",
    ],
  },
  {
    slug: "holiday",
    name: "Holiday",
    emoji: "🎄",
    gradient: "from-red-100 via-yellow-50 to-green-100",
    image: "/gallery/holiday.png",
    description:
      "Free printable holiday coloring pages for kids — Christmas, Halloween, Easter, and more. Make seasonal pages in seconds for classrooms and festive fun.",
    intro: [
      "Need an easy seasonal activity? CreateAndColor makes holiday-themed printable coloring pages in seconds — Christmas, Halloween, Easter, Thanksgiving, and more. Describe the festive scene and print.",
      "It's perfect for classrooms, family fun, and festive quiet time, with a fresh holiday page to color whenever you need one.",
    ],
    ideas: [
      "Santa and his reindeer",
      "A friendly Halloween pumpkin",
      "An Easter bunny with eggs",
      "A gingerbread house",
      "A snowman in a winter scene",
      "A turkey for Thanksgiving",
    ],
  },
  {
    slug: "homeschool-and-teachers",
    name: "Homeschool & Classroom",
    emoji: "🍎",
    gradient: "from-yellow-100 via-lime-50 to-green-100",
    image: "/gallery/homeschool.png",
    description:
      "Free printable coloring pages for homeschool and classrooms. Create custom pages tied to exactly what kids are learning — fast, flexible, and fun.",
    intro: [
      "Parents, teachers, and homeschoolers can use CreateAndColor to create printable coloring pages based on exactly what kids are learning or already love — the water cycle, farm animals, the letter A, a favorite story character, and more.",
      "It's fast and flexible: turn any lesson into a hands-on, screen-free activity in seconds. A teacher-friendly credits option is available for classroom use.",
    ],
    ideas: [
      "The life cycle of a butterfly",
      "Farm animals and a big red barn",
      "The planets in order",
      "A friendly letter A with apples",
      "A community helper firefighter",
      "Shapes and patterns to color",
    ],
    faqExtra: {
      q: "Is there a version for teachers and classrooms?",
      a: "Yes. CreateAndColor has a teacher mode with credits so you can generate custom coloring pages tied to your lessons for a whole class.",
    },
  },
];

export function getTheme(slug: string): ColoringTheme | undefined {
  return THEMES.find((t) => t.slug === slug);
}
