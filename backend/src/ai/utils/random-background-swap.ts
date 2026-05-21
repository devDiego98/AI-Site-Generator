import {
  REACTBITS_BACKGROUND_NAMES,
  REACTBITS_BACKGROUND_USAGE,
  type ReactBitsBackgroundName,
} from '../reactbits-background-usage';

const BACKGROUND_NAMES_PATTERN = REACTBITS_BACKGROUND_NAMES.join('|');

const COLOR_WORD =
  /\b(?:color|colours?|hue|palette|tint|shade|tone|gradient|colorstops?|color1|color2|color3|colors?|rayscolor|topcolor|particlecolors?|sparkcolor|basecolor|activecolor)\b/i;

const NAMED_COLOR =
  /\b(?:red|blue|green|cyan|teal|purple|violet|pink|orange|yellow|gold|silver|white|black|indigo|emerald|amber|rose|lime|navy|maroon|beige|cream)\b/i;

const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;

/** User wants to tweak palette only — keep the same ReactBits background component. */
export function isBackgroundColorOnlyRequest(instruction: string): boolean {
  const text = instruction.trim();
  if (!text || !/\bbackground\b/i.test(text)) {
    return false;
  }

  if (COLOR_WORD.test(text)) {
    return true;
  }

  const namedOrHex = `(?:${NAMED_COLOR.source}|${HEX_COLOR.source})`;

  if (
    new RegExp(
      `\\b(?:make|turn|set)\\b[\\s\\S]{0,30}\\bbackground\\b[\\s\\S]{0,30}\\b(?:more\\s+)?${namedOrHex}`,
      'i',
    ).test(text)
  ) {
    return true;
  }

  if (
    new RegExp(
      `\\bbackground\\b[\\s\\S]{0,30}\\b(?:to|into)\\b[\\s\\S]{0,20}\\b${namedOrHex}`,
      'i',
    ).test(text)
  ) {
    return true;
  }

  return false;
}

/** User asked to swap the background effect/component, not just its colors. */
export function isRandomBackgroundChangeRequest(instruction: string): boolean {
  const text = instruction.trim();
  if (!text) {
    return false;
  }

  if (mentionsSpecificBackground(text) || isBackgroundColorOnlyRequest(text)) {
    return false;
  }

  const componentSwap =
    /\b(?:swap|switch|replace|different|another|new|random)\b[\s\S]{0,30}\b(?:the\s+)?background\b/i;
  const componentSwapReverse =
    /\bbackground\b[\s\S]{0,30}\b(?:swap|switch|replace|different|another|new|random|effect|animation|style)\b/i;
  const changeComponent =
    /\b(?:change|try|pick|give\s+me|get)\b[\s\S]{0,40}\b(?:the\s+)?background\b(?!\s*(?:color|colour|hue|palette|tint|shade|tone|gradient)\b)/i;

  return (
    componentSwap.test(text) ||
    componentSwapReverse.test(text) ||
    changeComponent.test(text)
  );
}

function mentionsSpecificBackground(text: string): boolean {
  return new RegExp(`\\b(${BACKGROUND_NAMES_PATTERN})\\b`, 'i').test(text);
}

export function detectCurrentBackground(
  code: string,
): ReactBitsBackgroundName | null {
  const inReactbitsBg = extractReactbitsBgInner(code);
  const searchIn = inReactbitsBg ?? code;

  for (const name of REACTBITS_BACKGROUND_NAMES) {
    if (new RegExp(`<${name}(?:\\s|>|/)`).test(searchIn)) {
      return name;
    }
  }

  return null;
}

function extractReactbitsBgInner(code: string): string | null {
  const wrapperMatch = code.match(
    /<div[^>]*className=(?:"[^"]*reactbits-bg[^"]*"|'[^']*reactbits-bg[^']*'|{`[^`]*reactbits-bg[^`]*`}|{"[^"]*reactbits-bg[^"]*"}|{'[^']*reactbits-bg[^']*'})[^>]*>([\s\S]*?)<\/div>/i,
  );
  return wrapperMatch?.[1] ?? null;
}

export function pickRandomBackground(
  exclude?: ReactBitsBackgroundName | null,
): ReactBitsBackgroundName {
  const pool = exclude
    ? REACTBITS_BACKGROUND_NAMES.filter((n) => n !== exclude)
    : [...REACTBITS_BACKGROUND_NAMES];

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? REACTBITS_BACKGROUND_NAMES[0];
}

function buildComponentTagRegex(name: string): RegExp {
  return new RegExp(
    `<${name}(?:\\s[^>]*)?\\s*/>|<${name}(?:\\s[^>]*)?>[\\s\\S]*?</${name}>`,
    'g',
  );
}

function replaceBackgroundInRegion(
  region: string,
  current: ReactBitsBackgroundName | null,
  nextUsage: string,
): string {
  if (current) {
    const replaced = region.replace(buildComponentTagRegex(current), nextUsage);
    if (replaced !== region) {
      return replaced;
    }
  }

  for (const name of REACTBITS_BACKGROUND_NAMES) {
    const replaced = region.replace(buildComponentTagRegex(name), nextUsage);
    if (replaced !== region) {
      return replaced;
    }
  }

  return region;
}

/**
 * Replaces the ReactBits background with a specific component.
 */
export function replaceBackground(
  code: string,
  next: ReactBitsBackgroundName,
): { code: string; component: ReactBitsBackgroundName } {
  const current = detectCurrentBackground(code);
  const nextUsage = REACTBITS_BACKGROUND_USAGE[next];

  const wrapperMatch = code.match(
    /(<div[^>]*className=(?:"[^"]*reactbits-bg[^"]*"|'[^']*reactbits-bg[^']*'|{`[^`]*reactbits-bg[^`]*`}|{"[^"]*reactbits-bg[^"]*"}|{'[^']*reactbits-bg[^']*'})[^>]*>)([\s\S]*?)(<\/div>)/i,
  );

  if (wrapperMatch) {
    const [, open, inner, close] = wrapperMatch;
    let newInner = replaceBackgroundInRegion(inner, current, nextUsage);
    if (!newInner.trim()) {
      newInner = `\n        ${nextUsage}\n      `;
    }
    const updated = code.replace(wrapperMatch[0], `${open}${newInner}${close}`);
    return { code: updated, component: next };
  }

  let updated = code;
  if (current) {
    updated = updated.replace(buildComponentTagRegex(current), nextUsage);
  } else {
    for (const name of REACTBITS_BACKGROUND_NAMES) {
      const nextCode = updated.replace(buildComponentTagRegex(name), nextUsage);
      if (nextCode !== updated) {
        updated = nextCode;
        break;
      }
    }
  }

  return { code: updated, component: next };
}

/**
 * Swaps the ReactBits background inside `.reactbits-bg` (or the first known background tag) to a random component.
 */
export function applyRandomBackgroundSwap(
  code: string,
  options?: { exclude?: ReactBitsBackgroundName | null },
): { code: string; component: ReactBitsBackgroundName } {
  const current = detectCurrentBackground(code);
  const next = pickRandomBackground(options?.exclude ?? current);
  return replaceBackground(code, next);
}
