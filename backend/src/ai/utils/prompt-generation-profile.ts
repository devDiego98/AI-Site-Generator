import type { GenerationVariation } from './generation-variation';
import { pickFromVariationPool } from './generation-variation';
import { pickBackgroundForPrompt } from './prompt-themed-generation';
import { inferPrimaryTheme } from './prompt-theme-inference';

export type VisualMode = 'light' | 'dark';

export interface GenerationProfile {
  visualMode: VisualMode;
  archetype: string;
  layoutArchetype: string;
  pageStrategy: string;
  navigation: string;
  heroStyle: string;
  sections: string[];
  layoutNotes: string[];
  avoid: string[];
  variationNonce?: string;
  layoutTwist?: string;
}

const LIGHT_SIGNALS =
  /\b(light|bright|clean|minimal|white|pastel|soft|airy|daytime|wellness|spa|yoga|meditation|healthcare|medical|clinic|hospital|education|school|university|bakery|cafe|restaurant|food|wedding|bridal|baby|charity|nonprofit|organic|eco|nature|garden|lifestyle|fashion|interior|real estate|property|trustworthy|friendly|warm|inviting|calm)\b/i;

const DARK_SIGNALS =
  /\b(dark|night|neon|cyber|hacker|gaming|esport|noir|moody|cinematic|synthwave|crypto|blockchain|space|astronomy|futuristic|edgy|bold|dramatic|contrast|black)\b/i;

const HERO_PATTERNS = [
  'split layout — copy left, large image right (or reversed)',
  'centered hero — stacked headline, subtext, CTAs, image below',
  'full-bleed hero image with overlaid text and gradient scrim',
  'minimal typographic hero — no image, strong headline + single CTA',
  'bento-style hero — asymmetric grid of headline, stats, and image tiles',
  'product showcase hero — device mockup or feature image dominates',
] as const;

/** Layout archetypes 1–7 from reactbits-site-generator design standards */
const LAYOUT_ARCHETYPE_LABELS = [
  '1 — Editorial Magazine (full-width nav, full-bleed hero image below fold)',
  '2 — Split Hero Dashboard (Recharts live card in hero right column)',
  '3 — Centered Cinematic (floating UI cards around centered headline)',
  '4 — Minimal Cinematic (floating pill nav, bare hero on background)',
  '5 — Bento Grid (asymmetric feature card grid)',
  '6 — Scroll Narrative (sticky left image, scrolling feature copy right)',
  '7 — Magazine Hero with Tabs (hero + tabbed product views)',
] as const;

const LAYOUT_TWISTS = [
  'Use an asymmetric bento grid for at least one content block.',
  'Lead with a stats/metrics strip before the main narrative section.',
  'Alternate full-width bands with a narrow centered column for detail sections.',
  'Place primary CTA in a sticky side card on large screens (static on mobile).',
  'Open with a typographic-only band (no image) before the first image section.',
  'Use a two-column schedule: time column left, session cards right.',
  'Feature a horizontal scroll row for speakers or sponsors instead of a uniform grid.',
] as const;

const EVENT_EXPERIENCE_VARIANTS = [
  {
    pageStrategy:
      'Single scroll page (currentPage="main") — hero, story, agenda timeline, speakers, venue, register as stacked sections.',
    sections: [
      'event hero with date, city, and primary CTA',
      'why attend / theme overview',
      'agenda timeline',
      'speaker grid',
      'venue or map block',
      'registration CTA band',
    ],
    layoutTwist: 'Emphasize a vertical session timeline with alternating alignment.',
    navSalt: 2,
    heroSalt: 0,
  },
  {
    pageStrategy:
      'Two views via currentPage: "home" (overview) and "agenda" (full schedule) — nav switches between them.',
    sections: [
      'compact hero with countdown or date badge',
      'key topics / tracks',
      'schedule table or list',
      'sponsors or partners strip',
      'footer register CTA',
    ],
    layoutTwist: 'Split hero: event title and CTAs left, keynote visual right.',
    navSalt: 4,
    heroSalt: 1,
  },
  {
    pageStrategy:
      'Three views: home, speakers, register — labels and ids must match the prompt subject.',
    sections: [
      'bold hero',
      'featured keynote speakers (cards with role/org)',
      'ticket or RSVP section',
      'FAQ accordion',
      'contact / venue line',
    ],
    layoutTwist: 'Speaker-first: three large speaker cards above the fold on home.',
    navSalt: 0,
    heroSalt: 2,
  },
  {
    pageStrategy:
      'Single page with in-page anchor nav (no multi-route state) — scroll between schedule, speakers, and register.',
    sections: [
      'full-bleed hero with overlay text',
      'interactive agenda (tabs or filter by track)',
      'workshop / breakout list',
      'testimonials or past event photos',
      'register form section',
    ],
    layoutTwist: 'Agenda as tabbed tracks (e.g. main stage, workshops, networking).',
    navSalt: 5,
    heroSalt: 3,
  },
] as const;

const NAV_PATTERNS = [
  'top header bar with logo left, links center, CTA right',
  'minimal top nav — logo + 2–3 text links only',
  'sidebar navigation for app/dashboard layouts',
  'no global nav — in-page anchors or single-screen flow',
  'centered logo with underline tab links',
] as const;

function hashPrompt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickVariant<T>(
  prompt: string,
  pool: readonly T[],
  salt = 0,
  variation?: GenerationVariation,
): T {
  if (variation) {
    return pickFromVariationPool(pool, variation, salt);
  }
  return pool[(hashPrompt(prompt) + salt) % pool.length] ?? pool[0];
}

export function inferVisualMode(prompt: string): VisualMode {
  const text = prompt.toLowerCase();
  const lightScore = (text.match(LIGHT_SIGNALS) ?? []).length;
  const darkScore = (text.match(DARK_SIGNALS) ?? []).length;

  if (darkScore > lightScore) {
    return 'dark';
  }
  if (lightScore > darkScore) {
    return 'light';
  }

  const theme = inferPrimaryTheme(prompt);
  const lightThemes = new Set([
    'wellness',
    'healthcare',
    'education',
    'eco',
    'luxury',
    'retail',
  ]);
  if (lightThemes.has(theme)) {
    return 'light';
  }
  const darkThemes = new Set(['gaming', 'security', 'space', 'ai']);
  if (darkThemes.has(theme)) {
    return 'dark';
  }

  return hashPrompt(prompt) % 2 === 0 ? 'light' : 'dark';
}

function inferLayoutArchetype(
  prompt: string,
  inferredArchetype: string,
  variation?: GenerationVariation,
): string {
  const text = prompt.toLowerCase();
  const byTopic: Record<string, number> = {
    'finance-product': 2,
    'dashboard-app': 2,
    'telecom-service': 1,
    'maker-academy': 1,
    'pricing-focus': 5,
    'saas-product': 5,
    'creative-portfolio': 4,
    'event-experience': 6,
    'course-offering': 7,
    'single-screen': 3,
  };
  const idx = byTopic[inferredArchetype];
  if (idx != null) {
    return LAYOUT_ARCHETYPE_LABELS[idx - 1] ?? LAYOUT_ARCHETYPE_LABELS[0];
  }
  if (/\b(logistics|fleet|enterprise|infrastructure|b2b)\b/i.test(text)) {
    return LAYOUT_ARCHETYPE_LABELS[0];
  }
  if (/\b(fintech|analytics|dashboard|data platform|developer tool)\b/i.test(text)) {
    return LAYOUT_ARCHETYPE_LABELS[1];
  }
  if (/\b(ai tool|creative tool|minimal)\b/i.test(text)) {
    return LAYOUT_ARCHETYPE_LABELS[3];
  }
  const pool = LAYOUT_ARCHETYPE_LABELS;
  if (variation) {
    return pickFromVariationPool(pool, variation, 14);
  }
  return pool[hashPrompt(prompt) % pool.length] ?? pool[0];
}

function inferArchetype(
  prompt: string,
  variation?: GenerationVariation,
): {
  archetype: string;
  pageStrategy: string;
  navigation: string;
  sections: string[];
  avoid: string[];
  layoutTwist?: string;
} {
  const text = prompt.toLowerCase();

  if (/\b(pricing section|pricing page|three plans|subscription tiers)\b/i.test(text)) {
    return {
      archetype: 'pricing-focus',
      pageStrategy:
        'Single screen (currentPage="main") focused on pricing — comparison table or tier cards as the primary content.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 1, variation),
      sections: ['pricing tiers', 'feature comparison', 'FAQ', 'CTA'],
      avoid: [
        'generic multi-page SaaS marketing site',
        'unrelated hero about unrelated product',
      ],
    };
  }

  if (/\b(dashboard|admin panel|analytics panel|control panel)\b/i.test(text)) {
    return {
      archetype: 'dashboard-app',
      pageStrategy:
        'App shell with sidebar or top tabs — 3–6 views (overview, reports, settings, etc.) driven by currentPage.',
      navigation: 'sidebar navigation with icons/labels',
      sections: ['KPI cards', 'charts', 'data table', 'filters', 'recent activity'],
      avoid: ['marketing landing hero', 'pricing tables unless asked'],
    };
  }

  if (/\b(meetup|conference|event|summit|webinar|festival|ticket)\b/i.test(text)) {
    const eventVariant = variation
      ? pickFromVariationPool(EVENT_EXPERIENCE_VARIANTS, variation, 11)
      : EVENT_EXPERIENCE_VARIANTS[0];
    return {
      archetype: 'event-experience',
      pageStrategy: eventVariant.pageStrategy,
      navigation: pickVariant(
        prompt,
        NAV_PATTERNS,
        eventVariant.navSalt,
        variation,
      ),
      sections: [...eventVariant.sections],
      layoutTwist: variation
        ? pickFromVariationPool(LAYOUT_TWISTS, variation, 13)
        : eventVariant.layoutTwist,
      avoid: ['SaaS feature grid', 'generic startup landing'],
    };
  }

  if (/\b(course|academy|learning|curriculum|instructor|lesson|training)\b/i.test(text)) {
    return {
      archetype: 'course-offering',
      pageStrategy:
        'Course/education flow — often single long page or 2 pages (overview + curriculum/pricing).',
      navigation: pickVariant(prompt, NAV_PATTERNS, 3, variation),
      sections: [
        'course promise hero',
        'who it is for',
        'curriculum/modules',
        'instructor',
        'outcomes',
        'enrollment CTA',
      ],
      avoid: ['unrelated dashboard', 'generic tech startup template'],
    };
  }

  if (/\b(portfolio|agency|design studio|creative|showcase|case study)\b/i.test(text)) {
    return {
      archetype: 'creative-portfolio',
      pageStrategy:
        'Portfolio — single scrolling page or projects + about; emphasize visuals.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 4, variation),
      sections: ['statement hero', 'selected work grid', 'services', 'contact'],
      avoid: ['standard 3-column feature cards', 'pricing table unless asked'],
    };
  }

  if (/\b(finance|fintech|banking|budget|wallet|investment|personal finance)\b/i.test(text)) {
    return {
      archetype: 'finance-product',
      pageStrategy:
        'Finance app/site — trust-first layout; 1–2 pages max unless prompt lists more.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 5, variation),
      sections: [
        'value proposition',
        'security/trust signals',
        'key features',
        'app preview or metrics',
        'signup CTA',
      ],
      avoid: ['gaming aesthetics', 'event schedule sections'],
    };
  }

  if (/\b(3d printing|maker|fabrication|print farm)\b/i.test(text)) {
    return {
      archetype: 'maker-academy',
      pageStrategy:
        'Maker/academy site — highlight equipment, courses, gallery; 1–3 pages.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 6, variation),
      sections: [
        'bold hero',
        'equipment/capabilities',
        'courses or workshops',
        'gallery',
        'contact',
      ],
      avoid: ['generic SaaS dashboard', 'unrelated finance blocks'],
    };
  }

  if (/\b(telecom|fiber|network|isp|broadband|connectivity)\b/i.test(text)) {
    return {
      archetype: 'telecom-service',
      pageStrategy:
        'Telecom/ISP landing — speed, coverage, plans; single page or home + plans.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 7, variation),
      sections: ['speed/hero', 'coverage map or stats', 'plans', 'support CTA'],
      avoid: ['course curriculum', 'portfolio grid'],
    };
  }

  if (/\b(saas|b2b|software|platform)\b/i.test(text)) {
    return {
      archetype: 'saas-product',
      pageStrategy:
        'SaaS marketing — only if prompt implies SaaS; 1–4 pages if prompt mentions them.',
      navigation: pickVariant(prompt, NAV_PATTERNS, 8, variation),
      sections: ['product hero', 'integrations or logos', 'features', 'pricing optional'],
      avoid: ['using this template for non-SaaS prompts'],
    };
  }

  if (/\b(single|one page|one screen|landing only)\b/i.test(text)) {
    return {
      archetype: 'single-screen',
      pageStrategy: 'Exactly one view (currentPage="main") — no extra routes.',
      navigation: 'no multi-page nav — scroll sections only',
      sections: ['hero', 'primary content block', 'supporting detail', 'footer CTA'],
      avoid: ['multi-page routing', 'dashboard sidebar'],
    };
  }

  return {
    archetype: 'prompt-driven-custom',
    pageStrategy:
      'Invent a layout that fits ONLY this prompt — section order, density, and components should not resemble a default startup landing.',
    navigation: pickVariant(prompt, NAV_PATTERNS, 9, variation),
    layoutTwist: variation
      ? pickFromVariationPool(LAYOUT_TWISTS, variation, 12)
      : undefined,
    sections: [
      'derive sections from the user prompt nouns and goals',
      'omit sections that are not implied',
      'use unique section titles tied to the subject',
    ],
    avoid: [
      'copying a generic template (hero + 3 feature cards + testimonials + pricing + footer)',
      'adding pages the user did not imply',
    ],
  };
}

export function buildGenerationProfile(
  prompt: string,
  variation?: GenerationVariation,
): GenerationProfile {
  const visualMode = inferVisualMode(prompt);
  const inferred = inferArchetype(prompt, variation);
  const heroStyle = pickVariant(prompt, HERO_PATTERNS, 0, variation);

  const layoutArchetype = inferLayoutArchetype(
    prompt,
    inferred.archetype,
    variation,
  );

  const layoutNotes: string[] = [
    `Layout archetype: ${layoutArchetype} — follow navbar rules (pill nav ONLY for archetype 4).`,
    `Visual mode: ${visualMode} — ${
      visualMode === 'light'
        ? 'bg-[#f5f5f2]; SoftAurora/FloatingLines/Grainient/Threads/DotGrid/Iridescence/Ribbons; transparent sections; glass Cards shadow-none'
        : 'bg-[#0d0d0d]; Aurora/LiquidEther/LightRays/Hyperspeed/Galaxy/Particles/GridScan/DarkVeil; transparent sections; glass Cards shadow-none'
    }`,
    `Hero: ${heroStyle}`,
    'All sections below hero: Framer Motion useInView scroll animations (fade-up, stagger, or slide-in).',
    'Images: topic-matched Unsplash with ?w=&q=80, explicit heights, layout patterns only — never stacked full-width images.',
    'Spacing and grid columns should match content (not always 3-column feature grids).',
    'Section order and copy must reflect the exact subject in the user prompt.',
    'Use ReactBits background that fits the subject; tune color props to match light or dark shell.',
    variation
      ? `Suggested ReactBits background for this run: ${pickBackgroundForPrompt(prompt, variation)} (use it or another on-theme component — avoid repeating the same choice every time).`
      : 'Use a ReactBits background that fits the subject.',
  ];

  if (visualMode === 'light') {
    layoutNotes.push(
      'Prefer SoftAurora, FloatingLines, Grainient, LightRays, Ribbons, or subtle DotGrid on light shells.',
    );
  } else {
    layoutNotes.push(
      'Hyperspeed, Aurora, LiquidEther, Galaxy, DarkVeil work well on dark shells.',
    );
  }

  return {
    visualMode,
    archetype: inferred.archetype,
    layoutArchetype,
    pageStrategy: inferred.pageStrategy,
    navigation: inferred.navigation,
    heroStyle,
    sections: inferred.sections,
    layoutNotes,
    avoid: inferred.avoid,
    variationNonce: variation?.nonce,
    layoutTwist: inferred.layoutTwist,
  };
}

export function formatGenerationBrief(profile: GenerationProfile): string {
  const lines = [
    '=== GENERATION BRIEF (unique to this request — overrides generic templates) ===',
    profile.variationNonce
      ? `Variation ID: ${profile.variationNonce} — this run must look distinct from any prior run, even for the same topic.`
      : null,
    `Archetype: ${profile.archetype}`,
    `Layout archetype: ${profile.layoutArchetype}`,
    `Pages: ${profile.pageStrategy}`,
    `Navigation: ${profile.navigation}`,
    `Hero: ${profile.heroStyle}`,
    `Visual mode: ${profile.visualMode}`,
    `Sections to include (adapt titles/copy to the prompt): ${profile.sections.join('; ')}`,
    profile.layoutTwist ? `Layout twist: ${profile.layoutTwist}` : null,
    ...profile.layoutNotes.map((n) => `- ${n}`),
    `Do NOT: ${profile.avoid.join('; ')}`,
    'Invent fresh section titles, body copy, and component choices tied to the prompt — never reuse the same section order or wording as a generic template.',
    'Build markup structure, section order, and page count specifically for the user prompt below — not a reusable layout.',
  ];
  return lines.filter((line): line is string => line != null).join('\n');
}

export function augmentUserPromptForGeneration(
  prompt: string,
  variation?: GenerationVariation,
): string {
  const profile = buildGenerationProfile(prompt, variation);
  const brief = formatGenerationBrief(profile);
  return `${brief}\n\n=== USER PROMPT ===\n${prompt.trim()}`;
}
