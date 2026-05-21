import type { VisualMode } from './evaluate-ui-design';

/** Opaque fills — never use on cards, sections, headers (glass only). */
export const SOLID_LIGHT_BG =
  /\b(?:bg-white|bg-slate-50|bg-stone-50|bg-gray-50|bg-zinc-50)(?![\/\w-])/;

export const SOLID_DARK_BG =
  /\b(?:bg-slate-950|bg-slate-900|bg-\[#020617\]|bg-black)(?![\/\w-])/;

export const SOLID_BOX_BG =
  /\b(?:bg-white|bg-black)(?![\/\d\w-])/;

/** ShadCN semantic backgrounds that render as solid boxes in preview. */
export const OPAQUE_SEMANTIC_BG =
  /\b(?:bg-card|bg-background|bg-muted|bg-popover|bg-secondary|bg-accent)\b/g;

/** Dark page shell markers (no trailing \\b — Tailwind arbitrary values end with ]). */
export const DARK_SHELL_PATTERN =
  /(?:bg-slate-950|bg-slate-900|bg-\[#020617\]|bg-\[#0a0a0a\]|bg-\[#0b0b0b\]|bg-\[#0d0d0d\]|bg-black|text-\[#efefef\]|text-\[#f0f0f0\]|\btext-white\b)/;

export const LIGHT_SHELL_PATTERN =
  /(?:bg-slate-50|bg-\[#f2f2ef\]|bg-\[#f5f5f2\]|bg-\[#f4f4f1\]|bg-\[#fafaf8\]|\bbg-white\b|bg-stone-50|bg-gray-50|bg-zinc-50|text-\[#111111\]|\btext-slate-900\b)/;

/** Allowed opaque fills on the root page shell only. */
export const ROOT_SHELL_BG =
  /(?:bg-\[#0a0a0a\]|bg-\[#0b0b0b\]|bg-\[#0d0d0d\]|bg-\[#111114\]|bg-\[#f2f2ef\]|bg-\[#f5f5f2\]|bg-\[#f4f4f1\]|bg-\[#fafaf8\]|bg-slate-950|bg-slate-50)/;

/** Section/main/header must not use card-style surfaces. */
export const LAYOUT_SURFACE_PATTERN =
  /\b(?:backdrop-blur|shadow-(?:sm|md|lg|xl|2xl)|rounded-(?:2xl|3xl))\b/;

export const DARK_ON_DARK_TEXT =
  /\b(?:text-slate-900|text-slate-800|text-gray-900|text-gray-800|text-black|text-blue-(?:700|800|900|950)|text-indigo-(?:700|800|900|950)|text-violet-(?:700|800|900|950)|text-purple-(?:700|800|900|950)|text-primary-foreground)\b/;

/** Frosted glass — leaf cards only (not sections). */
export const DARK_GLASS_SURFACE =
  'backdrop-blur-[14px] saturate-150 bg-white/5 border border-white/[0.09] rounded-[14px] shadow-none';

export const LIGHT_GLASS_SURFACE =
  'backdrop-blur-[14px] saturate-150 bg-white/70 border border-black/[0.07] rounded-[14px] shadow-none';

export const GLASS_SURFACE = DARK_GLASS_SURFACE;

/** Minimal inset from viewport edges on layout containers. */
export const CONTAINER_MARGIN = 'm-2';

export const CONTAINER_PADDING = 'p-2';

export const DARK_ROOT_SHELL =
  'relative min-h-screen overflow-hidden bg-[#0d0d0d] text-[#f0f0f0]';

export const LIGHT_ROOT_SHELL =
  'relative min-h-screen overflow-hidden bg-[#f5f5f2] text-[#111111]';

/** Max-width constraint for floating navbar pill. */
export const NAV_MAX_WIDTH = 'w-[calc(100%-2rem)] max-w-[1120px]';

/** Three-zone navbar: logo left | links center | CTA right. */
export const NAV_ZONE_LAYOUT = 'justify-between gap-4';

/** Floating centered pill navbar — not full-width edge-to-edge. */
export const DARK_NAVBAR_SURFACE =
  `fixed top-5 left-1/2 -translate-x-1/2 z-[100] ${NAV_MAX_WIDTH} flex h-[52px] items-center ${NAV_ZONE_LAYOUT} rounded-full px-5 whitespace-nowrap backdrop-blur-[20px] saturate-[160%] bg-[#141414]/65 border border-white/10`;

export const LIGHT_NAVBAR_SURFACE =
  `fixed top-5 left-1/2 -translate-x-1/2 z-[100] ${NAV_MAX_WIDTH} flex h-[52px] items-center ${NAV_ZONE_LAYOUT} rounded-full px-5 whitespace-nowrap backdrop-blur-[20px] saturate-[160%] bg-white/65 border border-black/[0.08]`;

export function hasSolidLightBackground(classStr: string): boolean {
  return SOLID_LIGHT_BG.test(classStr);
}

export function hasSolidDarkBackground(classStr: string): boolean {
  return SOLID_DARK_BG.test(classStr);
}

export function hasSolidBoxBackground(classStr: string): boolean {
  return (
    SOLID_BOX_BG.test(classStr) ||
    SOLID_LIGHT_BG.test(classStr) ||
    SOLID_DARK_BG.test(classStr) ||
    OPAQUE_SEMANTIC_BG.test(classStr)
  );
}

export function hasGlassSurface(classStr: string): boolean {
  return (
    /\bbackdrop-blur/.test(classStr) &&
    (/\bbg-white\/[1-9]\d?\b/.test(classStr) ||
      /\bbg-black\/[1-9]\d?\b/.test(classStr) ||
      /\bbg-card\/[1-9]\d?\b/.test(classStr) ||
      /\bbg-background\/[1-9]\d?\b/.test(classStr) ||
      /\bbg-transparent\b/.test(classStr))
  );
}

export function glassSurfaceForMode(mode: VisualMode): string {
  return mode === 'light' ? LIGHT_GLASS_SURFACE : DARK_GLASS_SURFACE;
}

/** Contrasting CTA fills (bg-white + dark text or dark bg + white text) are allowed on controls. */
function stripContrastingCtaSurfaces(code: string): string {
  return code
    .replace(/<button\b[^>]*>/gi, '<button>')
    .replace(
      /<(?:a|span)\b[^>]*className=(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
      (match, dbl, sgl) => {
        const cls = dbl ?? sgl ?? '';
        const contrasting =
          (/\bbg-white\b/.test(cls) &&
            !/\bbg-white\//.test(cls) &&
            /\btext-\[#111111\]/i.test(cls)) ||
          (/\bbg-\[#111111\]/i.test(cls) && /\btext-white\b/.test(cls));
        if (contrasting && /\brounded-full\b/.test(cls)) {
          return match.replace(/className=(?:"[^"]*"|'[^']*')/, '');
        }
        return match;
      },
    );
}

/** Count opaque layout surfaces excluding the root page shell. */
export function countSolidBoxSurfaces(code: string): number {
  const withoutCtas = stripContrastingCtaSurfaces(code);
  const withoutRoot = withoutCtas.replace(
    /(<div\s+)className=(?:"([^"]*)"|'([^']*)')/,
    (match, prefix, dbl, sgl) => {
      const cls = dbl ?? sgl ?? '';
      if (/\bmin-h-screen\b/.test(cls) && ROOT_SHELL_BG.test(cls)) {
        const cleaned = cls
          .replace(/\bbg-white(?![\/\d\w-])/g, '')
          .replace(/\bbg-slate-50\b/g, '')
          .replace(/\bbg-slate-950\b/g, '')
          .replace(ROOT_SHELL_BG, '')
          .replace(/\s+/g, ' ')
          .trim();
        const quote = dbl !== undefined ? '"' : "'";
        return `${prefix}className=${quote}${cleaned}${quote}`;
      }
      return match;
    },
  );
  const matches = withoutRoot.match(
    /\bbg-white(?![\/\d\w-])|\bbg-black(?![\/\d\w-])|\bbg-slate-50\b|\bbg-slate-950\b|\bbg-stone-50\b|\bbg-card(?![\/\d\w-])|\bbg-background(?![\/\d\w-])|\bbg-muted(?![\/\d\w-])/g,
  );
  return matches?.length ?? 0;
}

/** Flags bg-white opacity that breaks legibility rules for the active visual mode. */
export function countHighOpacityBackgrounds(
  code: string,
  mode: VisualMode = 'dark',
): number {
  const matches = [...code.matchAll(/\bbg-white\/(\d+)\b/g)];
  return matches.filter((m) => {
    const opacity = Number.parseInt(m[1] ?? '0', 10);
    const start = Math.max(0, (m.index ?? 0) - 100);
    const context = code.slice(start, (m.index ?? 0) + 60);
    const hasBlur = /\bbackdrop-blur/.test(context);

    if (mode === 'light') {
      // Light theme cards use bg-white/70 with blur
      if (opacity <= 75 && hasBlur) {
        return false;
      }
      return opacity >= 90 || (opacity >= 40 && !hasBlur);
    }

    // Dark theme: only subtle glass (/5–/10)
    return opacity > 10;
  }).length;
}
