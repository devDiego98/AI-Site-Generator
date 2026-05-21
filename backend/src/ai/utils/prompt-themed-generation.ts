import type { ReactBitsBackgroundName } from '../reactbits-background-usage';
import { applyTopicImagesToCode } from './apply-topic-images';
import type { GenerationVariation } from './generation-variation';
import { pickFromVariationPool } from './generation-variation';
import type { PromptTheme } from './prompt-theme-types';
import {
  detectCurrentBackground,
  replaceBackground,
} from './random-background-swap';

import { inferPrimaryTheme } from './prompt-theme-inference';

export type { PromptTheme } from './prompt-theme-types';
export { inferPrimaryTheme } from './prompt-theme-inference';

interface ThemeRule {
  theme: PromptTheme;
  keywords: RegExp;
  backgrounds: readonly ReactBitsBackgroundName[];
}

const THEME_RULES: ThemeRule[] = [
  {
    theme: 'telecom',
    keywords:
      /\b(fiber|fibre|telecom|networking|isp|broadband|connectivity|cable|optic)\b/i,
    backgrounds: ['Hyperspeed', 'LaserFlow', 'GridScan'],
  },
  {
    theme: 'ai',
    keywords:
      /\b(ai\b|artificial intelligence|machine learning|ml\b|neural|gpt|llm|deep learning)\b/i,
    backgrounds: ['Aurora', 'LiquidEther', 'LightRays', 'Prism'],
  },
  {
    theme: 'saas',
    keywords:
      /\b(saas|b2b|dashboard|analytics|software|platform|subscription|pricing)\b/i,
    backgrounds: ['Hyperspeed', 'GridScan', 'DotGrid', 'LaserFlow'],
  },
  {
    theme: 'finance',
    keywords:
      /\b(finance|fintech|banking|investment|money|budget|wallet|crypto)\b/i,
    backgrounds: ['Galaxy', 'Aurora', 'DarkVeil', 'Orb'],
  },
  {
    theme: 'wellness',
    keywords:
      /\b(wellness|spa|meditation|yoga|mindful|calm|relax|health retreat)\b/i,
    backgrounds: ['SoftAurora', 'FloatingLines', 'Grainient'],
  },
  {
    theme: 'creative',
    keywords:
      /\b(agency|portfolio|design studio|creative|brand|art direction)\b/i,
    backgrounds: ['Particles', 'Iridescence', 'LiquidEther', 'SplashCursor'],
  },
  {
    theme: 'gaming',
    keywords: /\b(game|gaming|esport|playstation|xbox|arcade)\b/i,
    backgrounds: ['Hyperspeed', 'PixelSnow', 'Plasma', 'Galaxy'],
  },
  {
    theme: 'space',
    keywords: /\b(space|astronomy|cosmos|planet|rocket|science)\b/i,
    backgrounds: ['Galaxy', 'Aurora', 'LightRays', 'Prism'],
  },
  {
    theme: 'security',
    keywords: /\b(cyber|security|hacker|encryption|privacy|threat)\b/i,
    backgrounds: ['DarkVeil', 'GridScan', 'Hyperspeed', 'LaserFlow'],
  },
  {
    theme: 'events',
    keywords: /\b(event|meetup|conference|summit|webinar|ticket|festival)\b/i,
    backgrounds: ['Aurora', 'LightRays', 'LiquidEther', 'Particles'],
  },
  {
    theme: 'education',
    keywords:
      /\b(course|academy|learn|education|school|university|training|tutorial)\b/i,
    backgrounds: ['Aurora', 'FloatingLines', 'LightPillar', 'Threads'],
  },
  {
    theme: 'healthcare',
    keywords: /\b(healthcare|medical|clinic|hospital|doctor|patient)\b/i,
    backgrounds: ['SoftAurora', 'FloatingLines', 'Grainient'],
  },
  {
    theme: 'luxury',
    keywords:
      /\b(luxury|premium|real estate|property|estate|exclusive|high-end)\b/i,
    backgrounds: ['LightPillar', 'Iridescence', 'Prism', 'Orb'],
  },
  {
    theme: 'retail',
    keywords: /\b(shop|store|e-?commerce|retail|product catalog|boutique)\b/i,
    backgrounds: ['SplashCursor', 'Particles', 'DotGrid', 'PlasmaWave'],
  },
  {
    theme: 'eco',
    keywords:
      /\b(eco|sustainab|green energy|nature|environment|climate|organic)\b/i,
    backgrounds: ['Grainient', 'SoftAurora', 'FloatingLines', 'Aurora'],
  },
  {
    theme: 'music',
    keywords: /\b(music|audio|podcast|studio|concert|dj\b)\b/i,
    backgrounds: ['Orb', 'PlasmaWave', 'Plasma', 'LightRays'],
  },
];

const FALLBACK_BACKGROUNDS: ReactBitsBackgroundName[] = [
  'LiquidEther',
  'LightRays',
  'Grainient',
  'LightRays',
  'Aurora',
  'PlasmaWave',
  'Iridescence',
  'Threads',
  'PixelSnow',
  'SplashCursor',
];

function hashPrompt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFromPool<T>(pool: readonly T[], prompt: string, salt = 0): T {
  const index = (hashPrompt(prompt) + salt) % pool.length;
  return pool[index] ?? pool[0];
}

function buildBackgroundPool(prompt: string): ReactBitsBackgroundName[] {
  const text = prompt.trim().toLowerCase();
  const matchedPools: ReactBitsBackgroundName[] = [];

  for (const rule of THEME_RULES) {
    if (rule.keywords.test(text)) {
      matchedPools.push(...rule.backgrounds);
    }
  }

  return matchedPools.length > 0
    ? [...new Set(matchedPools)]
    : [...FALLBACK_BACKGROUNDS];
}

export function pickBackgroundForPrompt(
  prompt: string,
  variation?: GenerationVariation,
): ReactBitsBackgroundName {
  const pool = buildBackgroundPool(prompt);

  if (variation) {
    return pickFromVariationPool(pool, variation, hashPrompt(prompt) % 17);
  }

  return pickFromPool(pool, prompt);
}

export function applyPromptThemedBackground(
  prompt: string,
  code: string,
  variation?: GenerationVariation,
): { code: string; component: ReactBitsBackgroundName } {
  const component = pickBackgroundForPrompt(prompt, variation);
  return replaceBackground(code, component);
}

export interface ApplyPromptThemedGenerationOptions {
  pexelsApiKey?: string | null;
  variation?: GenerationVariation;
}

export async function applyPromptThemedGeneration(
  prompt: string,
  code: string,
  options: ApplyPromptThemedGenerationOptions = {},
): Promise<{ code: string; background: ReactBitsBackgroundName | null }> {
  const theme = inferPrimaryTheme(prompt);
  const variation = options.variation;

  let updated = code;
  if (!detectCurrentBackground(code)) {
    const { code: withBackground, component } = applyPromptThemedBackground(
      prompt,
      code,
      variation,
    );
    updated = withBackground;
    const withImages = await applyTopicImagesToCode(prompt, updated, theme, {
      pexelsApiKey: options.pexelsApiKey,
      variationNonce: variation?.nonce,
    });
    return { code: withImages, background: component };
  }

  const withImages = await applyTopicImagesToCode(prompt, updated, theme, {
    pexelsApiKey: options.pexelsApiKey,
    variationNonce: variation?.nonce,
  });

  return {
    code: withImages,
    background: detectCurrentBackground(withImages),
  };
}
