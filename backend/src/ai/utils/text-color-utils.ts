/** Tailwind palette text colors (non-neutral accents). */
const TAILWIND_ACCENT_TEXT =
  /\btext-(?:green|emerald|lime|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|red|orange|amber|yellow)-(?:\d{2,3}|[a-z]+)\b/;

/** Arbitrary hex/rgb text color (excluding shell defaults). */
const ARBITRARY_TEXT_COLOR = /\btext-\[(?!#(?:efefef|111111|f0f0f0)\b)[^\]]+\]/;

/** Inline style color on the element. */
const INLINE_COLOR_STYLE = /style=\{\{[^}]*\bcolor\s*:/i;

/**
 * True when attrs/className already set an explicit non-shell text color.
 * Used to avoid design pipeline overwriting user- or AI-requested accents.
 */
export function hasIntentionalTextColor(attrsOrClass: string): boolean {
  if (!attrsOrClass) {
    return false;
  }
  return (
    TAILWIND_ACCENT_TEXT.test(attrsOrClass) ||
    ARBITRARY_TEXT_COLOR.test(attrsOrClass) ||
    INLINE_COLOR_STYLE.test(attrsOrClass)
  );
}
