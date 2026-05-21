import type { PromptTheme } from './prompt-theme-types';

const STOPWORDS = new Set([
  'create',
  'landing',
  'page',
  'pages',
  'modern',
  'section',
  'interface',
  'visual',
  'using',
  'with',
  'that',
  'this',
  'from',
  'your',
  'about',
  'into',
  'have',
  'will',
  'should',
  'their',
  'them',
  'they',
  'make',
  'build',
  'design',
  'simple',
  'clean',
  'responsive',
  'app',
  'site',
  'website',
]);

/** Flickr tags for Lorem Flickr (no API key, topic-based). */
export const THEME_IMAGE_TAGS: Record<PromptTheme, readonly string[]> = {
  telecom: ['network', 'fiber', 'technology', 'server', 'cable'],
  ai: ['robot', 'technology', 'computer', 'data', 'circuit'],
  saas: ['software', 'office', 'laptop', 'business', 'teamwork'],
  finance: ['finance', 'money', 'banking', 'stock', 'business'],
  wellness: ['yoga', 'spa', 'meditation', 'wellness', 'nature'],
  creative: ['design', 'creative', 'art', 'studio', 'color'],
  gaming: ['gaming', 'esports', 'controller', 'neon', 'arcade'],
  space: ['space', 'galaxy', 'astronomy', 'stars', 'planet'],
  security: ['cybersecurity', 'technology', 'lock', 'code', 'server'],
  events: ['conference', 'audience', 'stage', 'networking', 'speaker'],
  education: ['education', 'classroom', 'students', 'learning', 'books'],
  healthcare: ['medical', 'doctor', 'hospital', 'healthcare', 'clinic'],
  luxury: ['luxury', 'interior', 'architecture', 'premium', 'hotel'],
  retail: ['shopping', 'product', 'store', 'retail', 'market'],
  eco: ['nature', 'sustainability', 'green', 'forest', 'solar'],
  music: ['music', 'concert', 'studio', 'instruments', 'dj'],
  generic: ['business', 'technology', 'people', 'office', 'city'],
};

const SLOT_TAG_OFFSETS = [
  '',
  'team',
  'product',
  'workspace',
  'hero',
  'portrait',
];

export const IMG_SRC_RE =
  /src=(?:"([^"]+)"|'([^']+)'|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/gi;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function extractPromptKeywords(prompt: string): string[] {
  const words =
    prompt
      .toLowerCase()
      .match(/\b[a-z][a-z0-9]{3,}\b/g)
      ?.filter((w) => !STOPWORDS.has(w)) ?? [];

  return [...new Set(words)].slice(0, 6);
}

export function buildImageSearchQuery(
  prompt: string,
  theme: PromptTheme,
): string {
  const themeTags = THEME_IMAGE_TAGS[theme];
  const promptWords = extractPromptKeywords(prompt);
  const parts = [themeTags[0], themeTags[1], ...promptWords.slice(0, 4)].filter(
    Boolean,
  );

  return [...new Set(parts)].join(' ').trim().slice(0, 100) || themeTags[0];
}

export function pickTagsForImageSlot(
  prompt: string,
  theme: PromptTheme,
  index: number,
): string[] {
  const themeTags = THEME_IMAGE_TAGS[theme];
  const promptWords = extractPromptKeywords(prompt);
  const slotOffset = SLOT_TAG_OFFSETS[index % SLOT_TAG_OFFSETS.length];
  const primary = themeTags[(index + hashString(prompt)) % themeTags.length];
  const secondary = themeTags[(index + 1) % themeTags.length];
  const fromPrompt = promptWords[index % Math.max(promptWords.length, 1)];

  const tags = [primary, secondary, slotOffset, fromPrompt].filter(
    (t): t is string => Boolean(t && t.length > 1),
  );

  return [...new Set(tags)].slice(0, 4);
}

export function parseImageDimensions(
  templateUrl: string,
  context?: { isAvatar?: boolean },
): { width: number; height: number } {
  const wMatch = /[?&]w=(\d+)/i.exec(templateUrl);
  const hMatch = /[?&]h=(\d+)/i.exec(templateUrl);

  if (wMatch && hMatch) {
    return { width: Number(wMatch[1]), height: Number(hMatch[1]) };
  }

  if (wMatch) {
    const width = Number(wMatch[1]);
    return { width, height: Math.round(width * 0.67) };
  }

  if (context?.isAvatar || /w=200|h=200|avatar/i.test(templateUrl)) {
    return { width: 200, height: 200 };
  }

  if (/w=600|thumbnail|card/i.test(templateUrl)) {
    return { width: 600, height: 600 };
  }

  return { width: 1200, height: 800 };
}

/** Lorem Flickr — free, tag-based photos (https://loremflickr.com). */
export function buildLoremFlickrUrl(
  width: number,
  height: number,
  tags: string[],
  lock: string | number,
): string {
  const tagPath = tags
    .map((t) => encodeURIComponent(t.replace(/\s+/g, '-').toLowerCase()))
    .join(',');
  return `https://loremflickr.com/${width}/${height}/${tagPath}?lock=${lock}`;
}

/** Picsum — free fallback with deterministic seed per slot. */
export function buildPicsumUrl(
  width: number,
  height: number,
  seed: string,
): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function buildTopicImageUrl(params: {
  prompt: string;
  theme: PromptTheme;
  index: number;
  width: number;
  height: number;
  externalUrl?: string | null;
  /** Per-request nonce so identical prompts get different photos each generation. */
  variationNonce?: string;
}): string {
  if (params.externalUrl) {
    return params.externalUrl;
  }

  const tags = pickTagsForImageSlot(params.prompt, params.theme, params.index);
  const lock = hashString(
    `${params.prompt}:${params.variationNonce ?? ''}:${params.index}:${params.width}x${params.height}`,
  );

  return buildLoremFlickrUrl(params.width, params.height, tags, lock);
}

export function getImageSrcFromMatch(match: RegExpExecArray): string {
  return match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
}

export function isReplaceableImageSrc(src: string): boolean {
  if (!src || src === '#' || src === '""') {
    return false;
  }
  if (src.startsWith('data:')) {
    return false;
  }
  return true;
}
