import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rateLimit';
import { getRequestUserRole } from '@/lib/auth';

export const maxDuration = 60;

interface Character {
  label: string;
  description: string;
}

interface StoryPage {
  pageNumber: number;
  storyText: string;
  illustrationDescription: string;
}

interface GeneratedStory {
  title: string;
  pages: StoryPage[];
}

// Pre-written story templates - AI only fills in character names (90% cost reduction)
interface StoryTemplate {
  id: string;
  theme: string;
  titleTemplate: string;
  pages: Array<{
    textTemplate: string;
    illustrationTemplate: string;
  }>;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  // SPACE TEMPLATES
  {
    id: 'space-1',
    theme: 'space',
    titleTemplate: "{CHAR1}'s Space Adventure",
    pages: [
      {
        textTemplate: "One starry night, {CHAR1} looked up at the sky and saw a tiny rocket ship! \"Would you like to explore the stars?\" asked a friendly alien.",
        illustrationTemplate: "Draw {CHAR1_DESC} looking up at a colorful rocket ship in a starry night sky with a friendly green alien waving."
      },
      {
        textTemplate: "{CHAR1} zoomed past colorful planets with {CHAR2}. \"Look at all the sparkly stars!\" they cheered together.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} inside a rocket ship flying past colorful planets with rings and sparkly stars."
      },
      {
        textTemplate: "Oh no! A little space puppy was lost on the moon. \"Don't worry, we'll help you!\" said {CHAR1} kindly.",
        illustrationTemplate: "Draw {CHAR1_DESC} on the moon's surface with a cute sad space puppy, with Earth visible in the background."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} worked together to find the puppy's home on a nearby planet covered in flowers.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} landing on a beautiful planet with colorful flowers, reuniting the puppy with its family."
      },
      {
        textTemplate: "\"Thank you for being so kind!\" said the space puppy. {CHAR1} learned that helping friends makes adventures even more fun!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} waving goodbye to the happy space puppy family, surrounded by stars and hearts."
      }
    ]
  },
  {
    id: 'space-2',
    theme: 'space',
    titleTemplate: "The Star Collectors",
    pages: [
      {
        textTemplate: "{CHAR1} found a magical telescope that could take them anywhere in space! \"Let's collect fallen stars,\" suggested {CHAR2}.",
        illustrationTemplate: "Draw {CHAR1_DESC} holding a sparkly magical telescope with {CHAR2_DESC} pointing excitedly at the night sky."
      },
      {
        textTemplate: "They flew to the Moon and found a glowing star hiding behind a crater. \"Found one!\" cheered {CHAR1}.",
        illustrationTemplate: "Draw {CHAR1_DESC} on the moon surface picking up a cute glowing star character, with craters and Earth in background."
      },
      {
        textTemplate: "On Saturn's rings, {CHAR2} spotted another star playing with space butterflies. They gently caught it in their special basket.",
        illustrationTemplate: "Draw {CHAR2_DESC} on Saturn's colorful rings catching a playful star among sparkly space butterflies."
      },
      {
        textTemplate: "But the stars missed their sky home! {CHAR1} said, \"Let's put them back where they belong.\"",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} looking at sad little star characters in a basket, realizing they need to go home."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} returned every star to the sky. Now the night sparkles brighter than ever because of their kindness!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} releasing happy glowing stars into a beautiful night sky, with the stars forming a heart shape."
      }
    ]
  },
  // OCEAN TEMPLATES
  {
    id: 'ocean-1',
    theme: 'ocean',
    titleTemplate: "{CHAR1}'s Underwater Treasure Hunt",
    pages: [
      {
        textTemplate: "{CHAR1} dove into the sparkling blue ocean with a magical snorkel that let them breathe underwater! A friendly fish swam up to say hello.",
        illustrationTemplate: "Draw {CHAR1_DESC} swimming underwater with a magical glowing snorkel, surrounded by colorful fish and bubbles."
      },
      {
        textTemplate: "\"I've lost my favorite pearl!\" cried a little octopus. {CHAR1} and {CHAR2} promised to help find it.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} underwater talking to a cute purple octopus who looks worried, with coral reef background."
      },
      {
        textTemplate: "They searched through colorful coral and tickly seaweed. A crab pointed the way with its tiny claw!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} searching through bright coral reef with a helpful red crab pointing, fish swimming around."
      },
      {
        textTemplate: "{CHAR1} found the pearl inside a giant clam shell! \"You found it!\" cheered the happy octopus.",
        illustrationTemplate: "Draw {CHAR1_DESC} opening a big clam shell to reveal a glowing pink pearl, with the excited octopus nearby."
      },
      {
        textTemplate: "The octopus hugged everyone with all eight arms! {CHAR1} learned that helping friends is the best treasure of all.",
        illustrationTemplate: "Draw the happy octopus hugging {CHAR1_DESC} and {CHAR2_DESC} with its arms, surrounded by smiling sea creatures and bubbles."
      }
    ]
  },
  {
    id: 'ocean-2',
    theme: 'ocean',
    titleTemplate: "The Magical Mermaid Party",
    pages: [
      {
        textTemplate: "{CHAR1} received a sparkly invitation made of seashells! The mermaids were having an underwater party!",
        illustrationTemplate: "Draw {CHAR1_DESC} holding a glittery seashell invitation, looking excited, with magical sparkles around."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} swam down to an underwater castle made of coral and pearls. Music floated through the water!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} swimming toward a beautiful coral castle with glowing windows and music notes in bubbles."
      },
      {
        textTemplate: "But oh no! The party decorations had floated away! \"We need more seashells and starfish,\" said the mermaid princess.",
        illustrationTemplate: "Draw a worried mermaid princess with {CHAR1_DESC} and {CHAR2_DESC} looking at the empty party space in the coral castle."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} collected beautiful shells and starfish. They decorated the whole castle in no time!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} decorating the underwater castle with colorful shells, starfish, and seaweed streamers."
      },
      {
        textTemplate: "The party was magical! Everyone danced with dolphins and ate seaweed cupcakes. {CHAR1} made wonderful new friends!",
        illustrationTemplate: "Draw a joyful underwater party with {CHAR1_DESC}, {CHAR2_DESC}, mermaids, and dolphins dancing, with decorations everywhere."
      }
    ]
  },
  // FAIRYTALE TEMPLATES
  {
    id: 'fairytale-1',
    theme: 'fairytale',
    titleTemplate: "{CHAR1} and the Magic Garden",
    pages: [
      {
        textTemplate: "In a land far away, {CHAR1} discovered a secret door behind the old oak tree. It led to the most magical garden ever!",
        illustrationTemplate: "Draw {CHAR1_DESC} discovering a small glowing door in a big oak tree, with fairy lights and mushrooms around."
      },
      {
        textTemplate: "Flowers talked and butterflies wore tiny crowns! {CHAR2} met a little fairy who needed help finding rainbow seeds.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} in a magical garden with talking flowers, crowned butterflies, and a tiny fairy."
      },
      {
        textTemplate: "They followed a path of golden stepping stones past a chocolate waterfall and cotton candy bushes!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} walking on golden stones past a chocolate waterfall and pink cotton candy bushes."
      },
      {
        textTemplate: "{CHAR1} found the rainbow seeds at the top of a candy cane hill! The fairy was so happy she did a little dance.",
        illustrationTemplate: "Draw {CHAR1_DESC} holding glowing rainbow seeds on top of a candy cane striped hill, with the dancing fairy."
      },
      {
        textTemplate: "Together they planted the seeds, and a beautiful rainbow tree grew! {CHAR1} learned that magical things happen when you help others.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} with the fairy watching a magnificent rainbow-colored tree growing, with sparkles everywhere."
      }
    ]
  },
  {
    id: 'fairytale-2',
    theme: 'fairytale',
    titleTemplate: "The Friendly Dragon's Birthday",
    pages: [
      {
        textTemplate: "{CHAR1} got a letter carried by a bluebird! It was an invitation to a dragon's birthday party at the castle!",
        illustrationTemplate: "Draw {CHAR1_DESC} reading a fancy letter held by a cute bluebird, with a fairytale castle in the background."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} baked the biggest, most colorful cake ever! They added sprinkles shaped like stars.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} in a kitchen decorating a huge rainbow layered cake with star sprinkles."
      },
      {
        textTemplate: "They walked through the enchanted forest where friendly gnomes helped carry the cake over a rainbow bridge.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} crossing a rainbow bridge with helpful gnomes carrying the big cake."
      },
      {
        textTemplate: "The dragon was purple and fluffy, not scary at all! He was so happy he accidentally sneezed out heart-shaped bubbles.",
        illustrationTemplate: "Draw a cute fluffy purple dragon sneezing heart bubbles, looking surprised, with {CHAR1_DESC} and {CHAR2_DESC} laughing."
      },
      {
        textTemplate: "Everyone sang happy birthday and ate cake! {CHAR1} learned that new friends can come in all shapes and sizes.",
        illustrationTemplate: "Draw a party scene with {CHAR1_DESC}, {CHAR2_DESC}, the dragon, gnomes, and fairies eating cake with balloons and streamers."
      }
    ]
  },
  // DINOSAUR TEMPLATES
  {
    id: 'dinosaur-1',
    theme: 'dinosaur',
    titleTemplate: "{CHAR1} Meets the Baby Dinosaurs",
    pages: [
      {
        textTemplate: "{CHAR1} found a time machine hidden in the backyard! With a flash of light, they traveled back to when dinosaurs roamed!",
        illustrationTemplate: "Draw {CHAR1_DESC} stepping out of a sparkly time machine into a prehistoric jungle with ferns and volcanoes."
      },
      {
        textTemplate: "A baby T-Rex was crying! His tiny arms couldn't reach the yummy leaves on the tall tree. \"We'll help!\" said {CHAR2}.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} meeting a cute crying baby T-Rex looking up at leaves on a tall palm tree."
      },
      {
        textTemplate: "{CHAR1} climbed on a friendly long-neck dinosaur who lifted them up high to pick the tastiest leaves!",
        illustrationTemplate: "Draw {CHAR1_DESC} riding on a smiling Brachiosaurus's neck, reaching for green leaves, with {CHAR2_DESC} watching below."
      },
      {
        textTemplate: "The baby T-Rex was so happy! He did a little dance and his dinosaur friends came to say thank you too.",
        illustrationTemplate: "Draw the happy baby T-Rex dancing while other cute baby dinosaurs gather around {CHAR1_DESC} and {CHAR2_DESC}."
      },
      {
        textTemplate: "{CHAR1} gave everyone big hugs before going home. Even small helpers can make a BIG difference!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} hugging the dinosaurs goodbye near the time machine, with hearts floating around."
      }
    ]
  },
  {
    id: 'dinosaur-2',
    theme: 'dinosaur',
    titleTemplate: "The Great Dino Race",
    pages: [
      {
        textTemplate: "{CHAR1} and {CHAR2} arrived in Dino Land just in time for the big race! All the dinosaurs were stretching their legs.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} at a race starting line with various colorful cute dinosaurs stretching."
      },
      {
        textTemplate: "But little Steggy the Stegosaurus was worried. \"I'm too slow to race,\" he said with a sad face.",
        illustrationTemplate: "Draw a cute sad baby Stegosaurus talking to {CHAR1_DESC} and {CHAR2_DESC}, other dinosaurs racing in background."
      },
      {
        textTemplate: "\"Everyone has something special!\" said {CHAR1}. They helped Steggy practice running through the jungle path.",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} jogging alongside the Stegosaurus through a colorful prehistoric jungle."
      },
      {
        textTemplate: "During the race, a tree fell on the track! Steggy's strong tail moved it easily. He saved the race!",
        illustrationTemplate: "Draw Steggy using his spiked tail to move a fallen tree while other dinosaurs and {CHAR1_DESC} cheer."
      },
      {
        textTemplate: "Steggy won the 'Super Helper' trophy! {CHAR1} learned that being yourself is always the best way to be.",
        illustrationTemplate: "Draw Steggy proudly holding a trophy while {CHAR1_DESC}, {CHAR2_DESC}, and dinosaurs celebrate with confetti."
      }
    ]
  },
  // FOREST TEMPLATES
  {
    id: 'forest-1',
    theme: 'forest',
    titleTemplate: "{CHAR1}'s Magical Forest Friends",
    pages: [
      {
        textTemplate: "{CHAR1} followed a trail of glowing mushrooms deep into the Whispering Woods. A bunny in a tiny hat waved hello!",
        illustrationTemplate: "Draw {CHAR1_DESC} walking on a path of glowing colorful mushrooms, meeting a cute bunny wearing a small top hat."
      },
      {
        textTemplate: "\"The Rainbow Waterfall has stopped flowing!\" cried a worried fox. Without it, the forest flowers couldn't grow.",
        illustrationTemplate: "Draw a worried cute fox talking to {CHAR1_DESC} and {CHAR2_DESC}, with wilting flowers and a dry waterfall behind."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} climbed up the mossy rocks with their new animal friends. Together they could do anything!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} climbing mossy rocks with the bunny and fox, butterflies guiding the way."
      },
      {
        textTemplate: "A grumpy troll had accidentally sat on the water pipe! He didn't mean to cause trouble. They helped him find a comfy rock instead.",
        illustrationTemplate: "Draw a cute grumpy troll sitting on pipes, with {CHAR1_DESC} and {CHAR2_DESC} showing him a nice rock nearby."
      },
      {
        textTemplate: "The rainbow waterfall flowed again! All the forest animals danced in the colorful mist. Kindness blooms everywhere!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} dancing with forest animals under a beautiful rainbow waterfall with flowers blooming."
      }
    ]
  },
  {
    id: 'forest-2',
    theme: 'forest',
    titleTemplate: "The Lost Acorn Adventure",
    pages: [
      {
        textTemplate: "{CHAR1} met a tiny squirrel named Nutkin in the forest. He had lost his special golden acorn somewhere!",
        illustrationTemplate: "Draw {CHAR1_DESC} meeting a cute worried squirrel named Nutkin in a magical forest with tall trees."
      },
      {
        textTemplate: "{CHAR1} and {CHAR2} looked under every leaf and behind every tree. A wise old owl gave them a clue: \"Follow the sparkles!\"",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} talking to a wise owl wearing glasses, with sparkly trail visible in the forest."
      },
      {
        textTemplate: "The sparkles led to a hollow log where a family of hedgehogs lived. They'd found the acorn and were keeping it safe!",
        illustrationTemplate: "Draw {CHAR1_DESC} and {CHAR2_DESC} peeking into a cozy hollow log where cute hedgehogs have the golden acorn."
      },
      {
        textTemplate: "Nutkin was so happy! He shared some of his acorn cookies with everyone as a thank-you treat.",
        illustrationTemplate: "Draw happy Nutkin the squirrel sharing acorn-shaped cookies with {CHAR1_DESC}, {CHAR2_DESC}, and the hedgehogs."
      },
      {
        textTemplate: "{CHAR1} learned that sharing makes everyone happy. They all became best forest friends forever!",
        illustrationTemplate: "Draw {CHAR1_DESC}, {CHAR2_DESC}, Nutkin, hedgehogs, and the owl having a happy picnic together in a sunny forest clearing."
      }
    ]
  }
];

// Select a random template for the given theme
function selectTemplate(theme: string): StoryTemplate {
  const themeTemplates = STORY_TEMPLATES.filter(t => t.theme === theme);
  if (themeTemplates.length === 0) {
    // Fallback to any template if theme not found
    return STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
  }
  return themeTemplates[Math.floor(Math.random() * themeTemplates.length)];
}

// Fill in the template with character information
function fillTemplate(
  template: StoryTemplate,
  characters: Character[],
  childName?: string
): GeneratedStory {
  const char1 = characters[0];
  const char2 = characters[1] || characters[0]; // Use first character if only one provided

  const replacements: Record<string, string> = {
    '{CHAR1}': char1.label,
    '{CHAR2}': char2.label,
    '{CHAR1_DESC}': `${char1.label} (${char1.description})`,
    '{CHAR2_DESC}': `${char2.label} (${char2.description})`,
  };

  // Add additional characters if available
  if (characters.length > 2) {
    characters.slice(2).forEach((char, i) => {
      replacements[`{CHAR${i + 3}}`] = char.label;
      replacements[`{CHAR${i + 3}_DESC}`] = `${char.label} (${char.description})`;
    });
  }

  const applyReplacements = (text: string): string => {
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    return result;
  };

  const title = childName
    ? `${childName}'s Adventure with ${char1.label}`
    : applyReplacements(template.titleTemplate);

  const pages: StoryPage[] = template.pages.map((page, index) => ({
    pageNumber: index + 1,
    storyText: applyReplacements(page.textTemplate),
    illustrationDescription: applyReplacements(page.illustrationTemplate),
  }));

  return { title, pages };
}

// Optional: Use cheap AI to add small personalization (minimal tokens)
async function personalizeTitle(
  baseTitle: string,
  theme: string,
  characterNames: string[]
): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return baseTitle;

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
        max_tokens: 20,
        temperature: 0.9,
        messages: [
          {
            role: 'user',
            content: `Create a fun children's book title (5-8 words) for a ${theme} adventure with ${characterNames.join(' and ')}. Just the title, nothing else.`,
          },
        ],
      }),
    });

    if (!response.ok) return baseTitle;

    const data = await response.json();
    const newTitle = data.choices?.[0]?.message?.content?.trim();

    // Validate the title is reasonable
    if (newTitle && newTitle.length > 5 && newTitle.length < 60) {
      return newTitle.replace(/['"]/g, '');
    }
    return baseTitle;
  } catch {
    return baseTitle;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = await getRequestUserRole(request);
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = userRole === 'ADMIN'
      ? { allowed: true, remaining: 999, resetIn: 0 }
      : checkRateLimit(identifier, { maxRequests: 10, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: "You've created too many storybooks. Please try again later!",
          resetIn: Math.ceil(rateLimit.resetIn / 60000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { characters, theme, childName } = body as {
      characters: Character[];
      theme: string;
      childName?: string;
    };

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        { error: 'No characters provided' },
        { status: 400 }
      );
    }

    console.log(`[Generate Story] Using template system for theme: ${theme}, characters: ${characters.length}`);

    // Select a template for the theme
    const template = selectTemplate(theme);
    console.log(`[Generate Story] Selected template: ${template.id}`);

    // Fill in the template with character information
    const story = fillTemplate(template, characters, childName);

    // Optionally personalize the title using cheap AI (only 20 tokens)
    if (process.env.TOGETHER_API_KEY) {
      const characterNames = characters.map(c => c.label);
      story.title = await personalizeTitle(story.title, theme, characterNames);
    }

    console.log(`[Generate Story] Created "${story.title}" with ${story.pages.length} pages (template-based)`);

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (error) {
    console.error('[Generate Story] Error:', error);
    return NextResponse.json(
      {
        error: 'Story generation failed',
        message: 'Could not create the story. Please try again.',
      },
      { status: 500 }
    );
  }
}
