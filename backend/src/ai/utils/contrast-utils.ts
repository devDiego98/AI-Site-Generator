import type { VisualMode } from './evaluate-ui-design';

function normalizeHex(hex: string): string {
  const h = hex.replace('#', '').toLowerCase();
  if (h.length === 3) {
    return h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return h.slice(0, 6);
}

function hexesMatch(a: string, b: string): boolean {
  return normalizeHex(a) === normalizeHex(b);
}

function extractBgHex(classStr: string): string | null {
  const arbitrary = classStr.match(/\bbg-\[(#[0-9a-fA-F]{3,8})\]/i);
  if (arbitrary) {
    return arbitrary[1];
  }
  if (/\bbg-black\b/.test(classStr)) {
    return '#000000';
  }
  if (/\bbg-white\b/.test(classStr) && !/\bbg-white\//.test(classStr)) {
    return '#ffffff';
  }
  return null;
}

function extractTextHex(classStr: string): string | null {
  const arbitrary = classStr.match(/\btext-\[(#[0-9a-fA-F]{3,8})\]/i);
  if (arbitrary) {
    return arbitrary[1];
  }
  if (/\btext-black\b/.test(classStr)) {
    return '#000000';
  }
  if (/\btext-white\b/.test(classStr) && !/\btext-white\//.test(classStr)) {
    return '#ffffff';
  }
  return null;
}

function isDarkHex(hex: string): boolean {
  const n = normalizeHex(hex);
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

const DARK_SOLID_BG =
  /\bbg-(?:black|slate-[789]00|gray-[789]00|zinc-[789]00|neutral-[789]00)\b|\bbg-\[#(?:0[0-9a-fA-F]{1,5}|1[0-4][0-9a-fA-F]{4})\]/i;

const DARK_FOREGROUND_TEXT =
  /\btext-(?:slate|gray|zinc|neutral)-(?:[6-9]00|950)\b|\btext-muted-foreground\b/;

/** Solid dark fill on a control (button, CTA link, badge). */
export function hasDarkSolidBackground(classStr: string): boolean {
  if (DARK_SOLID_BG.test(classStr)) {
    return true;
  }
  const bg = extractBgHex(classStr);
  return bg ? isDarkHex(bg) : false;
}

/** Solid light fill on a control. */
export function hasLightSolidBackground(classStr: string): boolean {
  if (/\bbg-white\b/.test(classStr) && !/\bbg-white\//.test(classStr)) {
    return true;
  }
  const bg = extractBgHex(classStr);
  return bg ? !isDarkHex(bg) : false;
}

/** Dark/muted text classes that disappear on dark button backgrounds. */
export function hasDarkForegroundText(classStr: string): boolean {
  if (DARK_FOREGROUND_TEXT.test(classStr)) {
    return true;
  }
  const text = extractTextHex(classStr);
  return text ? isDarkHex(text) : false;
}

/** True when solid bg and text use the same (or equivalent) hex — unreadable. */
export function hasMatchingTextAndBackground(classStr: string): boolean {
  const bg = extractBgHex(classStr);
  const text = extractTextHex(classStr);
  if (bg && text && hexesMatch(bg, text)) {
    return true;
  }
  return false;
}

/** Unreadable filled control: same-color, dark-on-dark, or light-on-light. */
export function hasLowContrastFilledControl(classStr: string): boolean {
  if (hasMatchingTextAndBackground(classStr)) {
    return true;
  }

  const filled =
    hasDarkSolidBackground(classStr) ||
    hasLightSolidBackground(classStr) ||
    /\bbg-(?:primary|secondary)\b/.test(classStr);
  if (!filled) {
    return false;
  }

  if (hasDarkSolidBackground(classStr)) {
    if (hasDarkForegroundText(classStr)) {
      return true;
    }
    const bg = extractBgHex(classStr);
    const text = extractTextHex(classStr);
    if (bg && text && isDarkHex(bg) && isDarkHex(text)) {
      return true;
    }
    if (/\btext-white\/(?:[0-2]\d|30)\b/.test(classStr)) {
      return true;
    }
  }

  if (hasLightSolidBackground(classStr)) {
    if (/\btext-white\b/.test(classStr) && !/\btext-white\//.test(classStr)) {
      return true;
    }
    const bg = extractBgHex(classStr);
    const text = extractTextHex(classStr);
    if (bg && text && !isDarkHex(bg) && !isDarkHex(text)) {
      return true;
    }
  }

  return false;
}

/** Picks readable text class for a solid background fill. */
export function contrastingTextForBackground(
  classStr: string,
  mode: VisualMode,
): string {
  const bg = extractBgHex(classStr);
  if (bg && isDarkHex(bg)) {
    return 'text-white';
  }
  if (bg && !isDarkHex(bg)) {
    return 'text-[#111111]';
  }
  if (hasDarkSolidBackground(classStr)) {
    return 'text-white';
  }
  if (hasLightSolidBackground(classStr)) {
    return 'text-[#111111]';
  }
  return mode === 'dark' ? 'text-[#f0f0f0]' : 'text-[#111111]';
}

/** Fixes unreadable text on buttons, links, and other filled controls. */
export function fixFilledControlContrast(
  classStr: string,
  mode: VisualMode,
): string {
  if (!hasLowContrastFilledControl(classStr)) {
    return classStr;
  }

  const replacement = contrastingTextForBackground(classStr, mode);
  let cls = classStr
    .replace(/\btext-\[(#[0-9a-fA-F]{3,8})\]/gi, replacement)
    .replace(/\btext-black\b/g, replacement)
    .replace(
      /\btext-(?:slate|gray|zinc|neutral)-(?:[6-9]00|950)\b/g,
      replacement,
    )
    .replace(/\btext-muted-foreground\b/g, replacement);

  if (hasDarkSolidBackground(cls)) {
    cls = cls.replace(/\btext-white\b(?!\/.)/g, replacement);
    if (!/\btext-(?:white|\[#f0f0f0\]|\[#efefef\])/i.test(cls)) {
      cls = `${cls} ${replacement}`.trim();
    }
  } else if (hasLightSolidBackground(cls)) {
    cls = cls.replace(/\btext-white\b(?!\/.)/g, replacement);
    if (!/\btext-\[#111111\]/i.test(cls) && !/\btext-black\b/.test(cls)) {
      cls = `${cls} ${replacement}`.trim();
    }
  }

  return cls.replace(/\s+/g, ' ').trim();
}

/** @deprecated Use fixFilledControlContrast */
export function fixMatchingTextBackground(
  classStr: string,
  mode: VisualMode,
): string {
  return fixFilledControlContrast(classStr, mode);
}

export function countMatchingTextBackgroundInCode(code: string): number {
  return countLowContrastFilledControlsInCode(code);
}

export function countLowContrastFilledControlsInCode(code: string): number {
  const matches = code.match(/className=(?:"[^"]*"|'[^']*')/g) ?? [];
  return matches.filter((m) => {
    const inner = m.slice(m.indexOf('=') + 2, -1).replace(/^["']|["']$/g, '');
    return hasLowContrastFilledControl(inner);
  }).length;
}
