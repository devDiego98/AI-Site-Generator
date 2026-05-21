import {
  CONTAINER_MARGIN,
  CONTAINER_PADDING,
  DARK_NAVBAR_SURFACE,
  DARK_ROOT_SHELL,
  glassSurfaceForMode,
  hasSolidBoxBackground,
  LIGHT_NAVBAR_SURFACE,
  LIGHT_ROOT_SHELL,
  NAV_MAX_WIDTH,
  NAV_ZONE_LAYOUT,
  OPAQUE_SEMANTIC_BG,
} from './design-tokens';
import {
  fixFilledControlContrast,
  hasDarkSolidBackground,
  hasLightSolidBackground,
} from './contrast-utils';
import {
  fixMergedJsxTagAttributes,
  fixShadcnButtonTags,
  formatOpenTagAttrs,
  replaceJsxOpenTags,
} from './jsx-tag-utils';
import { stripDisabledReactBitsBackgrounds } from './random-background-swap';
import {
  evaluateUiDesign,
  inferVisualModeFromCode,
  type DesignEvaluation,
  type VisualMode,
} from './evaluate-ui-design';
import { hasIntentionalTextColor } from './text-color-utils';

const CLASSNAME_ATTR =
  /className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\})/g;

const HEADING_OPEN = /<(h[1-6])(\s[^>]*)?>/gi;
const SECTION_OPEN = /<section(\s[^>]*)?>/gi;
const MAIN_OPEN = /<main(\s[^>]*)?>/gi;
const HEADER_OPEN = /<header(\s[^>]*)?>/gi;
const NAV_OPEN = /<nav(\s[^>]*)?>/gi;
const CARD_OPEN = /<Card(\s[^>]*)?>/gi;
const CARD_BARE = /<Card\s*\/>/gi;
const CARD_BARE_CLOSE = /<Card>/gi;

function dedupeClasses(cls: string): string {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const token of cls.split(/\s+/)) {
    if (!token || seen.has(token)) {
      continue;
    }
    seen.add(token);
    tokens.push(token);
  }
  return tokens.join(' ');
}

function hadOpaqueBackground(cls: string): boolean {
  return (
    hasSolidBoxBackground(cls) ||
    OPAQUE_SEMANTIC_BG.test(cls) ||
    /\bbg-white\/(?:[2-9]\d|[1-9]\d{2,})\b/.test(cls) ||
    /\bbg-black\/(?:[2-9]\d|[1-9]\d{2,})\b/.test(cls) ||
    /\bbg-slate-\d{2,3}\b/.test(cls)
  );
}

/** Remove opaque fills; ReactBits stays visible on unstyled sections. */
export function stripOpaqueBackgrounds(cls: string): string {
  const next = cls
    .replace(OPAQUE_SEMANTIC_BG, '')
    .replace(/\bbg-white(?![/\d\w-])/g, '')
    .replace(/\bbg-black(?![/\d\w-])/g, '')
    .replace(/\bbg-slate-50\b/g, '')
    .replace(/\bbg-slate-950\b/g, '')
    .replace(/\bbg-slate-900\b/g, '')
    .replace(/\bbg-stone-50\b/g, '')
    .replace(/\bbg-gray-50\b/g, '')
    .replace(/\bbg-white\/(?:[2-9]\d|[1-9]\d{2,})\b/g, '')
    .replace(/\bbg-black\/(?:[2-9]\d|[1-9]\d{2,})\b/g, '')
    .replace(/\bbg-slate-\d{2,3}\b/g, '')
    .replace(/\bbg-gray-\d{2,3}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return dedupeClasses(next);
}

/** Glass only when a container intentionally had a background. */
export function applyGlassSurface(cls: string, mode: VisualMode): string {
  const glass = glassSurfaceForMode(mode);
  let next = stripOpaqueBackgrounds(cls);
  if (!/\bbackdrop-blur\b/.test(next)) {
    next = `${glass} ${next}`.trim();
  } else if (!/\bbg-(?:white|black)\/[1-9]/.test(next)) {
    next = `${glass} ${next}`.trim();
  }
  return dedupeClasses(next);
}

function remapClasses(classStr: string, mode: VisualMode): string {
  let cls = classStr.replace(/\s+/g, ' ').trim();
  if (!cls) {
    return cls;
  }

  const useGlass = hadOpaqueBackground(cls);
  cls = stripOpaqueBackgrounds(cls);
  if (useGlass) {
    cls = applyGlassSurface(cls, mode);
  }

  const hasDarkFill = hasDarkSolidBackground(cls);
  const hasLightFill = hasLightSolidBackground(cls);
  const preserveTextColors = hasIntentionalTextColor(cls);

  if (!preserveTextColors) {
    if (mode === 'dark') {
      if (!hasLightFill) {
        cls = cls
          .replace(/\btext-slate-900\b/g, 'text-slate-100')
          .replace(/\btext-slate-800\b/g, 'text-slate-200')
          .replace(/\btext-gray-900\b/g, 'text-slate-100')
          .replace(/\btext-black\b/g, 'text-[#efefef]')
          .replace(/\btext-\[#111111\]\b/g, 'text-[#efefef]')
          .replace(/\btext-blue-(?:700|800|900|950)\b/g, 'text-white')
          .replace(/\btext-indigo-(?:700|800|900|950)\b/g, 'text-white')
          .replace(/\btext-primary\b/g, 'text-[#efefef]');
      }
    } else if (hasLightFill) {
      // Only remap light text on elements with an opaque light fill — hero copy
      // over ReactBits/photo backgrounds often has no bg class but needs text-white.
      cls = cls
        .replace(/\btext-white\b(?!\/.)/g, 'text-[#111111]')
        .replace(/\btext-\[#efefef\]\b/g, 'text-[#111111]')
        .replace(/\btext-\[#f0f0f0\]\b/g, 'text-[#111111]')
        .replace(/\btext-slate-100\b/g, 'text-black/50');
    }
  }

  return dedupeClasses(fixFilledControlContrast(cls, mode));
}

function rewriteAllClassNames(code: string, mode: VisualMode): string {
  let rootSkipped = false;
  return code.replace(
    CLASSNAME_ATTR,
    (match: string, dbl?: string, sgl?: string, tpl?: string, jsx?: string) => {
      const raw = dbl ?? sgl ?? tpl ?? jsx ?? '';
      if (!rootSkipped && /min-h-screen/.test(raw)) {
        rootSkipped = true;
        return match;
      }
      const remapped = remapClasses(raw, mode);
      if (remapped === raw) {
        return match;
      }
      const quote = match.includes('className="')
        ? '"'
        : match.includes("className='")
          ? "'"
          : dbl !== undefined
            ? '"'
            : "'";
      return `className=${quote}${remapped}${quote}`;
    },
  );
}

function normalizeRootShell(code: string, mode: VisualMode): string {
  const target = mode === 'dark' ? DARK_ROOT_SHELL : LIGHT_ROOT_SHELL;
  return code.replace(
    /(<div\s+)className=(?:"([^"]*)"|'([^']*)')/,
    (_match: string, prefix: string, dbl?: string, sgl?: string) => {
      const quote = dbl !== undefined ? '"' : "'";
      const targetParts = new Set(target.split(/\s+/));
      const preserved = (dbl ?? sgl ?? '')
        .split(/\s+/)
        .filter((c: string) => c && !targetParts.has(c) && /^z-\d+$/.test(c))
        .join(' ');
      const merged = `${target} ${preserved}`.replace(/\s+/g, ' ').trim();
      return `${prefix}className=${quote}${merged}${quote}`;
    },
  );
}

function appendClasses(attrs: string, toAdd: string): string {
  const additions = toAdd.trim();
  if (!additions) {
    return formatOpenTagAttrs(attrs);
  }

  const normalized = formatOpenTagAttrs(attrs);
  const classMatch = normalized.match(/className=(?:"([^"]*)"|'([^']*)')/);
  if (classMatch) {
    const quote = normalized.includes('className="') ? '"' : "'";
    const existing = classMatch[1] ?? classMatch[2] ?? '';
    const merged = `${existing} ${additions}`.trim().replace(/\s+/g, ' ');
    return normalized.replace(
      classMatch[0],
      `className=${quote}${merged}${quote}`,
    );
  }

  return `${normalized} className="${additions}"`;
}

/** Strip layout glass from className value only — never trim attr leading space. */
function stripLayoutSurfaceFromAttrs(attrs: string): string {
  const classMatch = attrs.match(/className=(?:"([^"]*)"|'([^']*)')/);
  if (!classMatch) {
    return attrs;
  }
  const quote = attrs.includes('className="') ? '"' : "'";
  const raw = classMatch[1] ?? classMatch[2] ?? '';
  const stripped = stripLayoutSurfaceClasses(raw);
  return attrs.replace(classMatch[0], `className=${quote}${stripped}${quote}`);
}

function hasMarginUtility(classStr: string): boolean {
  return /\b(?:m-\d+|mx-\d+|my-\d+|mt-\d+|mb-\d+|ml-\d+|mr-\d+|m-\[)\b/.test(
    classStr,
  );
}

function hasSpacingUtility(classStr: string): boolean {
  return /\b(?:p[xytblr]?-\d+|py-\[|px-\[|gap-\d+|space-[xy]-\d+)\b/.test(
    classStr,
  );
}

/** Remove card-style surfaces from layout wrappers (sections/main). */
export function stripLayoutSurfaceClasses(cls: string): string {
  const next = cls
    .replace(/\bbackdrop-blur(?:-\[[^\]]+\]|-[a-zA-Z0-9]+)?/g, '')
    .replace(/\bsaturate-\[[^\]]+\]/g, '')
    .replace(/\bbg-white\/\d+/g, '')
    .replace(/\bbg-\[#f2f2ef\]\/\d+/g, '')
    .replace(/\bbg-\[#0b0b0b\]\/\d+/g, '')
    .replace(/\brounded-(?:2xl|3xl|xl)/g, '')
    .replace(/\brounded-\[[^\]]+\]/g, '')
    .replace(/\bshadow[-\w]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return dedupeClasses(stripOpaqueBackgrounds(next));
}

function ensureLayoutInsets(attrs: string): string {
  let next = attrs;
  if (!hasMarginUtility(next)) {
    next = appendClasses(next, CONTAINER_MARGIN);
  }
  if (!/\b(?:p-\d|px-|py-|p-\[)\b/.test(next)) {
    next = appendClasses(next, CONTAINER_PADDING);
  }
  return next;
}

/** Cards and panels that should use glass. */
function ensureGlassPanel(attrs: string, mode: VisualMode): string {
  const next = ensureLayoutInsets(attrs);
  const classMatch = next.match(/className=(?:"([^"]*)"|'([^']*)')/);
  if (classMatch) {
    const quote = next.includes('className="') ? '"' : "'";
    const raw = classMatch[1] ?? classMatch[2] ?? '';
    const glassed = applyGlassSurface(raw, mode);
    return next.replace(classMatch[0], `className=${quote}${glassed}${quote}`);
  }
  return appendClasses(
    next,
    `${glassSurfaceForMode(mode)} ${CONTAINER_MARGIN} ${CONTAINER_PADDING}`,
  );
}

function fixHeadings(code: string, mode: VisualMode): string {
  return code.replace(
    HEADING_OPEN,
    (match: string, tag: string, attrs: string = '') => {
      let nextAttrs = attrs;
      const level = Number(tag.slice(1));
      const sizeClass =
        level === 1 ? 'text-4xl' : level === 2 ? 'text-3xl' : 'text-2xl';
      const textClass = mode === 'dark' ? 'text-[#efefef]' : 'text-[#111111]';
      const hasColor = hasIntentionalTextColor(nextAttrs);

      if (!/\btext-(?:2xl|3xl|4xl|5xl|6xl)\b/.test(nextAttrs)) {
        const additions = hasColor
          ? `${sizeClass} font-bold`
          : `${sizeClass} font-bold ${textClass}`;
        nextAttrs = appendClasses(nextAttrs, additions);
      } else {
        nextAttrs = appendClasses(nextAttrs, 'font-bold');
        if (!/\btext-(?:white|slate-9)/.test(nextAttrs) && !hasColor) {
          nextAttrs = appendClasses(nextAttrs, textClass);
        }
      }

      return `<${tag}${formatOpenTagAttrs(nextAttrs)}>`;
    },
  );
}

function fixBodyCopy(code: string, mode: VisualMode): string {
  const tags = ['p', 'li', 'span', 'a', 'label', 'td', 'th'];
  let fixed = code;
  for (const tag of tags) {
    const re = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    fixed = fixed.replace(re, (match: string, attrs: string = '') => {
      if (
        /\btext-(?:white|slate-|gray-|muted)/.test(attrs) ||
        hasIntentionalTextColor(attrs)
      ) {
        return match;
      }
      const addition = mode === 'dark' ? 'text-white/55' : 'text-black/55';
      return `<${tag}${formatOpenTagAttrs(appendClasses(attrs, addition))}>`;
    });
  }
  return fixed;
}

function fixSectionsAndMain(code: string): string {
  let fixed = code.replace(
    SECTION_OPEN,
    (_match: string, attrs: string = '') => {
      let next = stripLayoutSurfaceFromAttrs(attrs ?? '');
      if (!/\bpy-/.test(next)) {
        next = appendClasses(
          next,
          'py-[clamp(4rem,9vw,9rem)] px-[clamp(1rem,5vw,4rem)]',
        );
      }
      if (!hasMarginUtility(next) && !hasSpacingUtility(next)) {
        next = appendClasses(next, CONTAINER_MARGIN);
      }
      return `<section${formatOpenTagAttrs(next)}>`;
    },
  );
  fixed = fixed.replace(MAIN_OPEN, (_match: string, attrs: string = '') => {
    const next = stripLayoutSurfaceFromAttrs(ensureLayoutInsets(attrs ?? ''));
    return `<main${formatOpenTagAttrs(next)}>`;
  });
  return fixed;
}

function ensureNavLayoutClasses(attrs: string): string {
  let next = attrs;
  if (!/\bmax-w-/.test(next)) {
    next = appendClasses(next, NAV_MAX_WIDTH);
  }
  if (!/\bjustify-between\b/.test(next)) {
    next = appendClasses(next, NAV_ZONE_LAYOUT);
  }
  return next;
}

function fixButtons(code: string, mode: VisualMode): string {
  return replaceJsxOpenTags(code, 'button', (attrs) => {
    const classMatch = attrs.match(/className=(?:"([^"]*)"|'([^']*)')/);
    if (!classMatch) {
      const fill =
        mode === 'dark'
          ? 'rounded-full bg-white text-[#111111] font-semibold min-h-[44px]'
          : 'rounded-full bg-[#111111] text-white font-semibold min-h-[44px]';
      return formatOpenTagAttrs(appendClasses(attrs, fill));
    }
    const quote = attrs.includes('className="') ? '"' : "'";
    const raw = classMatch[1] ?? classMatch[2] ?? '';
    const fixed = fixFilledControlContrast(raw, mode);
    if (fixed === raw) {
      return attrs;
    }
    return attrs.replace(classMatch[0], `className=${quote}${fixed}${quote}`);
  });
}

function fixHeaderNav(code: string, mode: VisualMode): string {
  const navBar = mode === 'dark' ? DARK_NAVBAR_SURFACE : LIGHT_NAVBAR_SURFACE;

  let fixed = code.replace(
    HEADER_OPEN,
    (_match: string, attrs: string = '') => {
      const stripped = stripLayoutSurfaceFromAttrs(attrs ?? '');
      return `<header${formatOpenTagAttrs(
        appendClasses(ensureNavLayoutClasses(stripped), navBar),
      )}>`;
    },
  );

  fixed = fixed.replace(NAV_OPEN, (_match: string, attrs: string = '') => {
    const linkColor =
      mode === 'dark'
        ? 'text-white/50 hover:text-[#f0f0f0]'
        : 'text-black/50 hover:text-[#111111]';
    const stripped = stripLayoutSurfaceFromAttrs(attrs ?? '');
    const withLayout = ensureNavLayoutClasses(stripped);
    if (/left-1\/2/.test(withLayout)) {
      return `<nav${formatOpenTagAttrs(appendClasses(withLayout, linkColor))}>`;
    }
    return `<nav${formatOpenTagAttrs(
      appendClasses(appendClasses(withLayout, navBar), linkColor),
    )}>`;
  });

  return fixed;
}

function fixReactBitsCanvas(code: string): string {
  return code.replace(
    /className=(["'])([^"']*reactbits-bg[^"']*)(["'])/gi,
    (_match, quote: string, cls: string) => {
      let next = cls.replace(/\babsolute\b/g, 'fixed');
      const required = [
        'reactbits-bg',
        'fixed',
        'inset-0',
        'z-0',
        'pointer-events-none',
      ];
      for (const token of required) {
        if (
          !new RegExp(`\\b${token.replace(/[[\]]/g, '\\$&')}\\b`).test(next)
        ) {
          next = `${token} ${next}`;
        }
      }
      return `className=${quote}${dedupeClasses(next)}${quote}`;
    },
  );
}

function fixBareCards(code: string, mode: VisualMode): string {
  const glass = glassSurfaceForMode(mode);
  return code
    .replace(CARD_BARE, `<Card className="${glass} ${CONTAINER_MARGIN}">`)
    .replace(
      CARD_BARE_CLOSE,
      `<Card className="${glass} ${CONTAINER_MARGIN}">`,
    );
}

function fixCards(code: string, mode: VisualMode): string {
  return code.replace(CARD_OPEN, (_match: string, attrs: string = '') => {
    return `<Card${ensureGlassPanel(attrs ?? '', mode)}>`;
  });
}

/** Forces one visual mode: full dark + light text OR full light + dark text. */
export function enforceUnifiedVisualMode(
  code: string,
  mode: VisualMode,
): string {
  let fixed = fixShadcnButtonTags(
    fixReactBitsCanvas(stripDisabledReactBitsBackgrounds(code)),
  );
  fixed = normalizeRootShell(fixed, mode);
  fixed = rewriteAllClassNames(fixed, mode);
  fixed = fixBareCards(fixed, mode);
  fixed = fixHeaderNav(fixed, mode);
  fixed = fixButtons(fixed, mode);
  fixed = fixSectionsAndMain(fixed);
  fixed = fixCards(fixed, mode);
  fixed = fixHeadings(fixed, mode);
  fixed = fixBodyCopy(fixed, mode);
  return fixMergedJsxTagAttributes(fixed);
}

/** Applies safe, deterministic design fixes before evaluation. */
export function applyUiDesignFixes(code: string): string {
  const visualMode = inferVisualModeFromCode(code);
  return enforceUnifiedVisualMode(code, visualMode);
}

export interface DesignPipelineResult {
  code: string;
  evaluation: DesignEvaluation;
  fixed: boolean;
}

const MAX_PASSES = 4;

/** Run unified-mode enforcement + evaluation until pass or max passes. */
export function runDesignQualityPipeline(code: string): DesignPipelineResult {
  const visualMode = inferVisualModeFromCode(code);
  let current = enforceUnifiedVisualMode(code, visualMode);
  let evaluation = evaluateUiDesign(current);
  let fixed = current !== code;

  for (let pass = 0; pass < MAX_PASSES && !evaluation.passed; pass += 1) {
    current = enforceUnifiedVisualMode(current, visualMode);
    fixed = true;
    evaluation = evaluateUiDesign(current);
  }

  return { code: current, evaluation, fixed };
}
