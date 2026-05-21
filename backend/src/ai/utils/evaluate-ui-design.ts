import {
  countLowContrastFilledControlsInCode,
  countMatchingTextBackgroundInCode,
  hasDarkSolidBackground,
} from './contrast-utils';
import {
  countHighOpacityBackgrounds,
  countSolidBoxSurfaces,
  DARK_ON_DARK_TEXT,
  DARK_SHELL_PATTERN,
  hasGlassSurface,
  LIGHT_SHELL_PATTERN,
  LAYOUT_SURFACE_PATTERN,
  ROOT_SHELL_BG,
} from './design-tokens';

function isHeroSection(classStr: string): boolean {
  return /\bmin-h-\[(?:100svh|100vh)\]|\bmin-h-screen\b/.test(classStr);
}

/** Hero allows badge pills; forbids full-section glass. Content sections must stay transparent. */
function sectionUsesForbiddenSurface(classStr: string): boolean {
  if (isHeroSection(classStr)) {
    return (
      /\bbackdrop-blur-(?:\[20px\]|xl|2xl)\b/.test(classStr) &&
      (/\bbg-white\/(?:[2-9]|[1-9]\d)\b/.test(classStr) ||
        /\brounded-(?:2xl|3xl)\b/.test(classStr))
    );
  }
  return (
    LAYOUT_SURFACE_PATTERN.test(classStr) ||
    (hasGlassSurface(classStr) && /\bbackdrop-blur/.test(classStr))
  );
}

export type DesignIssueCategory = 'contrast' | 'typography' | 'spacing' | 'structure';

export type DesignIssueSeverity = 'error' | 'warning';

export interface DesignIssue {
  category: DesignIssueCategory;
  severity: DesignIssueSeverity;
  message: string;
}

export type VisualMode = 'light' | 'dark';

export interface DesignEvaluation {
  passed: boolean;
  visualMode: VisualMode;
  issues: DesignIssue[];
  /** Errors block release to the user. */
  errorCount: number;
}

/** Text classes that are too light on light backgrounds (without overlay). */
const LIGHT_ON_LIGHT_TEXT =
  /\b(?:text-white(?!\/)|text-slate-100|text-gray-100)\b/;

const HEADING_TAG = /<h([1-6])\b([^>]*)>/gi;
const SECTION_TAG = /<section\b([^>]*)>/gi;
const MAIN_TAG = /<main\b([^>]*)>/gi;
const CARD_TAG = /<Card\b([^>]*)>/gi;
const CARD_TOKEN = /<Card\b[^>]*>|<\/Card>/gi;

/** True only when a Card opens before its parent's closing tag (sibling Cards are OK). */
export function hasNestedCards(code: string): boolean {
  let depth = 0;
  let match: RegExpExecArray | null;
  CARD_TOKEN.lastIndex = 0;
  while ((match = CARD_TOKEN.exec(code)) !== null) {
    const tag = match[0];
    if (tag.startsWith('</Card')) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (/\/\s*>$/.test(tag)) {
      continue;
    }
    depth += 1;
    if (depth > 1) {
      return true;
    }
  }
  return false;
}

function extractClassNames(attrs: string): string[] {
  const classes: string[] = [];
  const re = /className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\})/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrs)) !== null) {
    const raw = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
    classes.push(...raw.split(/\s+/).filter(Boolean));
  }
  return classes;
}

function classString(attrs: string): string {
  return extractClassNames(attrs).join(' ');
}

/** className value whose quoted string contains index (for per-element contrast checks). */
function classNameAtIndex(code: string, index: number): string | null {
  const re = /className=(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const value = match[1] ?? match[2] ?? '';
    const valueStart = match.index + match[0].indexOf(value);
    const valueEnd = valueStart + value.length;
    if (index >= valueStart && index <= valueEnd) {
      return value;
    }
  }
  return null;
}

export function inferVisualModeFromCode(code: string): VisualMode {
  if (/bg-\[#0a0a0a\]|bg-\[#0b0b0b\]|bg-\[#0d0d0d\]|bg-\[#111114\]/.test(code)) {
    return 'dark';
  }
  if (/bg-\[#f2f2ef\]|bg-\[#f5f5f2\]|bg-\[#f4f4f1\]|bg-\[#fafaf8\]/.test(code)) {
    return 'light';
  }

  const rootMatch = code.match(
    /<div\s+className=(?:"([^"]*)"|'([^']*)')/,
  );
  if (rootMatch) {
    const rootClasses = rootMatch[1] ?? rootMatch[2] ?? '';
    if (DARK_SHELL_PATTERN.test(rootClasses)) {
      return 'dark';
    }
    if (LIGHT_SHELL_PATTERN.test(rootClasses)) {
      return 'light';
    }
    if (/\btext-white\b/.test(rootClasses)) {
      return 'dark';
    }
    if (/\btext-slate-900\b/.test(rootClasses)) {
      return 'light';
    }
  }

  const darkHits = (code.match(DARK_SHELL_PATTERN) ?? []).length;
  const lightHits = (code.match(LIGHT_SHELL_PATTERN) ?? []).length;
  if (darkHits > lightHits) {
    return 'dark';
  }
  if (lightHits > darkHits) {
    return 'light';
  }
  return 'light';
}

function hasMarginUtility(classStr: string): boolean {
  return /\b(?:m-\d+|mx-\d+|my-\d+|mt-\d+|mb-\d+|ml-\d+|mr-\d+|m-\[)\b/.test(
    classStr,
  );
}

function hasSpacingUtility(classStr: string): boolean {
  return /\b(?:p[xytblr]?-\d+|py-\[|px-\[|gap-\d+|space-[xy]-\d+)\b/.test(classStr);
}

function hasHeadingScale(classStr: string): boolean {
  return /\btext-(?:2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/.test(classStr);
}

export function evaluateUiDesign(code: string): DesignEvaluation {
  const visualMode = inferVisualModeFromCode(code);
  const issues: DesignIssue[] = [];

  const solidBoxes = countSolidBoxSurfaces(code);
  if (solidBoxes > 0) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message: `Layout containers must not use opaque backgrounds (found ${solidBoxes}×). Use frosted glass: backdrop-blur-xl bg-white/5 (dark) or bg-white/75 (light) on sections, cards, and navbar.`,
    });
  }

  const heavyOpacity = countHighOpacityBackgrounds(code, visualMode);
  if (heavyOpacity > 0) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message:
        visualMode === 'light'
          ? `${heavyOpacity} container(s) use invalid backgrounds for light mode — use backdrop-blur-xl bg-white/75 border-black/8 on glass surfaces (not near-opaque bg-white/90+ without blur).`
          : `${heavyOpacity} container(s) use high-opacity backgrounds on dark mode — use backdrop-blur-xl bg-white/5 border-white/10 only.`,
    });
  }

  let cardMatch: RegExpExecArray | null;
  let cardsWithoutGlass = 0;
  while ((cardMatch = CARD_TAG.exec(code)) !== null) {
    const cls = classString(cardMatch[1] ?? '');
    if (!hasGlassSurface(cls) && /\b(?:bg-card|bg-background|bg-white(?![\/])|bg-slate)\b/.test(cls)) {
      cardsWithoutGlass += 1;
    }
  }
  if (/<Card\s*\/>/.test(code) || /<Card>(?!\s+className)/.test(code)) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message:
        'Bare <Card> without glass className — add backdrop-blur-xl bg-white/5 border border-white/10 (dark) or bg-white/75 border-black/8 (light).',
    });
  }
  if (cardsWithoutGlass > 0) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message: `${cardsWithoutGlass} Card(s) use opaque backgrounds — use frosted glass surfaces only.`,
    });
  }

  let sectionMatchGlass: RegExpExecArray | null;
  let sectionsWithSurface = 0;
  let sectionsWithOpaque = 0;
  while ((sectionMatchGlass = SECTION_TAG.exec(code)) !== null) {
    const cls = classString(sectionMatchGlass[1] ?? '');
    if (/\b(?:bg-card|bg-background|bg-white(?![\/])|bg-slate-50)\b/.test(cls)) {
      sectionsWithOpaque += 1;
    }
    if (sectionUsesForbiddenSurface(cls)) {
      sectionsWithSurface += 1;
    }
  }
  if (sectionsWithOpaque > 0) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message: `${sectionsWithOpaque} <section> uses opaque bg — sections must be transparent; use padding only so the ReactBits background stays visible.`,
    });
  }
  if (sectionsWithSurface > 0) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message: `${sectionsWithSurface} <section> uses card-style surfaces (backdrop-blur/shadow/large radius) — remove glass from sections; apply frosted glass on individual Cards only.`,
    });
  }

  if (hasNestedCards(code)) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message:
        'Nested Card components detected — use one surface level only; never wrap a Card inside another Card.',
    });
  }

  if (/\bshadow-(?:sm|md|lg|xl|2xl)\b/.test(code) && /<Card\b/.test(code)) {
    issues.push({
      category: 'structure',
      severity: 'warning',
      message:
        'Cards should not use box shadows — use shadow-none; frosted border is the only separator.',
    });
  }

  const navOpen = code.match(/<nav\b([^>]*)>/i);
  if (navOpen) {
    const navCls = classString(navOpen[1] ?? '');
    if (!/\bmax-w-/.test(navCls)) {
      issues.push({
        category: 'structure',
        severity: 'error',
        message:
          'Navbar must use max-w-[1120px] (with w-[calc(100%-2rem)]) — constrain header width, not edge-to-edge.',
      });
    }
    if (!/\bjustify-between\b/.test(navCls)) {
      issues.push({
        category: 'structure',
        severity: 'error',
        message:
          'Navbar must use justify-between with three zones: logo on the left, nav links centered (wrap in flex-1 justify-center), Sign up / Login / avatar CTA on the right.',
      });
    }
  }

  if (
    /<(?:header|nav)\b[^>]*\bw-full\b/i.test(code) &&
    !/left-1\/2|-translate-x-1\/2|rounded-full/.test(code)
  ) {
    issues.push({
      category: 'structure',
      severity: 'warning',
      message:
        'Navbar should be a floating centered pill (fixed top-5 left-1/2 -translate-x-1/2 rounded-full) — not a full-width bar.',
    });
  }

  const heroH1InCard = /<Card[^>]*>[\s\S]*?<h1\b/i.test(code);
  if (heroH1InCard) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message:
        'Hero headline must sit bare on the background — never inside a Card or glass box.',
    });
  }

  if (!DARK_SHELL_PATTERN.test(code) && !LIGHT_SHELL_PATTERN.test(code)) {
    issues.push({
      category: 'structure',
      severity: 'warning',
      message:
        'Page shell should set visual mode explicitly (e.g. bg-[#0b0b0b] text-[#efefef] or bg-[#f2f2ef] text-[#111111]).',
    });
  }

  if (/\breactbits-bg\b/.test(code) && !/\breactbits-bg[^>]*\bfixed\b/.test(code)) {
    issues.push({
      category: 'structure',
      severity: 'warning',
      message:
        'ReactBits canvas should use fixed inset-0 z-0 pointer-events-none — not absolute positioning.',
    });
  }

  const lowContrastControls = countLowContrastFilledControlsInCode(code);
  const sameColorControls = countMatchingTextBackgroundInCode(code);
  if (lowContrastControls > 0) {
    issues.push({
      category: 'contrast',
      severity: 'error',
      message: `${lowContrastControls} button(s) or CTA(s) have unreadable text contrast (dark text on dark bg, light on light, or matching hex). Use dark bg + text-white, or light bg + text-[#111111] — never muted/dark text on filled dark buttons.`,
    });
  } else if (sameColorControls > 0) {
    issues.push({
      category: 'contrast',
      severity: 'error',
      message: `${sameColorControls} element(s) use the same color for background and text (e.g. bg-[#111111] text-[#111111]) — text becomes unreadable. Use contrasting pairs: dark bg + light text, or light bg + dark text.`,
    });
  }

  if (visualMode === 'dark') {
    if (
      !/\btext-\[#efefef\]\b/.test(code) &&
      !/\btext-\[#f0f0f0\]\b/.test(code) &&
      !/\btext-white\b/.test(code) &&
      !/\btext-slate-(?:50|100|200)\b/.test(code)
    ) {
      issues.push({
        category: 'contrast',
        severity: 'error',
        message:
          'Dark pages need light foreground text on the shell (text-[#f0f0f0], text-white, or text-slate-100).',
      });
    }

    let darkTextMatch: RegExpExecArray | null;
    const darkTextRe = new RegExp(DARK_ON_DARK_TEXT.source, 'gi');
    while ((darkTextMatch = darkTextRe.exec(code)) !== null) {
      issues.push({
        category: 'contrast',
        severity: 'error',
        message: `Low contrast on dark background: "${darkTextMatch[0]}" — use text-white, text-slate-100/200, or text-muted-foreground.`,
      });
      if (issues.filter((i) => i.category === 'contrast').length >= 5) {
        break;
      }
    }
  }

  if (visualMode === 'light') {
    if (
      !/\btext-\[#111111\]\b/.test(code) &&
      !/\btext-slate-900\b/.test(code) &&
      !/\btext-slate-800\b/.test(code)
    ) {
      issues.push({
        category: 'contrast',
        severity: 'warning',
        message:
          'Light pages should use dark body text (text-[#111111] or text-slate-900) on the main shell.',
      });
    }

    let lightTextMatch: RegExpExecArray | null;
    const lightTextRe = new RegExp(LIGHT_ON_LIGHT_TEXT.source, 'gi');
    while ((lightTextMatch = lightTextRe.exec(code)) !== null) {
      const cls = classNameAtIndex(code, lightTextMatch.index);
      const context = code.slice(
        Math.max(0, lightTextMatch.index - 120),
        lightTextMatch.index + 80,
      );
      if (/bg-gradient|from-slate-9|from-black|overlay/i.test(context)) {
        continue;
      }
      if (cls && hasDarkSolidBackground(cls)) {
        continue;
      }
      issues.push({
        category: 'contrast',
        severity: 'error',
        message: `Low contrast on light background: "${lightTextMatch[0]}" — use text-slate-900 or text-slate-800.`,
      });
      if (issues.filter((i) => i.category === 'contrast' && i.severity === 'error').length >= 5) {
        break;
      }
    }
  }

  let headingMatch: RegExpExecArray | null;
  while ((headingMatch = HEADING_TAG.exec(code)) !== null) {
    const level = Number(headingMatch[1]);
    const attrs = headingMatch[2] ?? '';
    const cls = classString(attrs);
    if (!hasHeadingScale(cls)) {
      const minSize =
        level === 1 ? 'text-4xl' : level === 2 ? 'text-3xl' : 'text-2xl';
      issues.push({
        category: 'typography',
        severity: level <= 2 ? 'error' : 'warning',
        message: `<h${level}> should include a display size (e.g. ${minSize} font-bold).`,
      });
    }
    if (
      visualMode === 'dark' &&
      DARK_ON_DARK_TEXT.test(cls) &&
      !/\btext-\[#efefef\]\b/.test(cls) &&
      !/\btext-\[#f0f0f0\]\b/.test(cls)
    ) {
      issues.push({
        category: 'typography',
        severity: 'error',
        message: `<h${level}> uses dark text classes on a dark page — use text-[#efefef] or text-slate-100.`,
      });
    }
  }

  let sectionMatch: RegExpExecArray | null;
  let sectionsWithoutSpacing = 0;
  while ((sectionMatch = SECTION_TAG.exec(code)) !== null) {
    const cls = classString(sectionMatch[1] ?? '');
    if (!hasSpacingUtility(cls)) {
      sectionsWithoutSpacing += 1;
    }
  }
  if (sectionsWithoutSpacing > 0) {
    issues.push({
      category: 'spacing',
      severity: 'warning',
      message: `${sectionsWithoutSpacing} <section> should include vertical padding (e.g. py-[clamp(4rem,9vw,9rem)]).`,
    });
  }

  let mainMatch: RegExpExecArray | null;
  while ((mainMatch = MAIN_TAG.exec(code)) !== null) {
    const cls = classString(mainMatch[1] ?? '');
    if (!hasSpacingUtility(cls) && !hasMarginUtility(cls)) {
      issues.push({
        category: 'spacing',
        severity: 'warning',
        message: '<main> should include layout spacing (padding or max-width wrapper).',
      });
    }
  }

  if (!/\b(?:py-\d+|p-\d+|gap-\d+|space-y-\d+)\b/.test(code)) {
    issues.push({
      category: 'spacing',
      severity: 'error',
      message:
        'Layout needs consistent spacing utilities (py-12 on sections, gap-4/gap-6 in grids, space-y-4 in stacks).',
    });
  }

  const rootMatch = code.match(
    /<div\s+className=(?:"([^"]*)"|'([^']*)')/,
  );
  if (rootMatch) {
    const rootCls = rootMatch[1] ?? rootMatch[2] ?? '';
    if (/\bmin-h-screen\b/.test(rootCls) && !ROOT_SHELL_BG.test(rootCls)) {
      issues.push({
        category: 'structure',
        severity: 'warning',
        message:
          'Root shell should include a subtle page base (bg-[#0a0a0a] or bg-[#f4f4f1]) under the animated background.',
      });
    }
  }

  if (
    /\bmin-h-screen\b/.test(code) &&
    !/\breactbits-bg\b/.test(code)
  ) {
    issues.push({
      category: 'structure',
      severity: 'error',
      message: 'Missing ReactBits background wrapper (reactbits-bg).',
    });
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  return {
    passed: errorCount === 0,
    visualMode,
    issues,
    errorCount,
  };
}

export function formatDesignEvaluationError(evaluation: DesignEvaluation): string {
  const errors = evaluation.issues.filter((i) => i.severity === 'error');
  const lines = errors.map((e) => `- [${e.category}] ${e.message}`);
  return [
    `Design quality check failed (${evaluation.visualMode} mode, ${errors.length} issue(s)).`,
    'Fix before shipping:',
    ...lines.slice(0, 12),
    errors.length > 12 ? `- …and ${errors.length - 12} more` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
