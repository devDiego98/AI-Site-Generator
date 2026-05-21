import type { PromptTheme } from './prompt-theme-types';

interface ThemeRule {
  theme: PromptTheme;
  keywords: RegExp;
}

const THEME_RULES: ThemeRule[] = [
  {
    theme: 'telecom',
    keywords:
      /\b(fiber|fibre|telecom|networking|isp|broadband|connectivity|cable|optic)\b/i,
  },
  {
    theme: 'ai',
    keywords:
      /\b(ai\b|artificial intelligence|machine learning|ml\b|neural|gpt|llm|deep learning)\b/i,
  },
  {
    theme: 'saas',
    keywords:
      /\b(saas|b2b|dashboard|analytics|software|platform|subscription|pricing)\b/i,
  },
  {
    theme: 'finance',
    keywords:
      /\b(finance|fintech|banking|investment|money|budget|wallet|crypto)\b/i,
  },
  {
    theme: 'wellness',
    keywords:
      /\b(wellness|spa|meditation|yoga|mindful|calm|relax|health retreat)\b/i,
  },
  {
    theme: 'creative',
    keywords:
      /\b(agency|portfolio|design studio|creative|brand|art direction)\b/i,
  },
  {
    theme: 'gaming',
    keywords: /\b(game|gaming|esport|playstation|xbox|arcade)\b/i,
  },
  {
    theme: 'space',
    keywords: /\b(space|astronomy|cosmos|planet|rocket|science)\b/i,
  },
  {
    theme: 'security',
    keywords: /\b(cyber|security|hacker|encryption|privacy|threat)\b/i,
  },
  {
    theme: 'events',
    keywords: /\b(event|meetup|conference|summit|webinar|ticket|festival)\b/i,
  },
  {
    theme: 'education',
    keywords:
      /\b(course|academy|learn|education|school|university|training|tutorial)\b/i,
  },
  {
    theme: 'healthcare',
    keywords: /\b(healthcare|medical|clinic|hospital|doctor|patient)\b/i,
  },
  {
    theme: 'luxury',
    keywords:
      /\b(luxury|premium|real estate|property|estate|exclusive|high-end)\b/i,
  },
  {
    theme: 'retail',
    keywords: /\b(shop|store|e-?commerce|retail|product catalog|boutique)\b/i,
  },
  {
    theme: 'eco',
    keywords:
      /\b(eco|sustainab|green energy|nature|environment|climate|organic)\b/i,
  },
  {
    theme: 'music',
    keywords: /\b(music|audio|podcast|studio|concert|dj\b)\b/i,
  },
];

function scoreThemeRule(rule: ThemeRule, text: string): number {
  if (!rule.keywords.test(text)) {
    return 0;
  }

  const matches = text.match(rule.keywords);
  let score = matches?.length ?? 1;

  if (
    rule.theme === 'education' &&
    /\b(course|academy|class|curriculum|lesson|instructor)\b/i.test(text)
  ) {
    score += 3;
  }

  if (rule.theme === 'ai' && /\b(course|academy|class)\b/i.test(text)) {
    score -= 2;
  }

  if (
    rule.theme === 'finance' &&
    /\b(finance|fintech|banking|budget|wallet)\b/i.test(text)
  ) {
    score += 2;
  }

  return score;
}

export function inferPrimaryTheme(prompt: string): PromptTheme {
  const text = prompt.trim().toLowerCase();
  let bestTheme: PromptTheme = 'generic';
  let bestScore = 0;

  for (const rule of THEME_RULES) {
    const score = scoreThemeRule(rule, text);
    if (score > bestScore) {
      bestScore = score;
      bestTheme = rule.theme;
    }
  }

  return bestTheme;
}
