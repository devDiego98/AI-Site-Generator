/** Matches tag names stuck to attributes, e.g. <navclassName= */
const MERGED_TAG_ATTR =
  /<([a-z][a-z0-9]*)((?:className|type|href|id|role|style|onClick|on[A-Z][a-zA-Z]*)=)/gi;

/** Inserts missing space between tag name and attributes. */
export function fixMergedJsxTagAttributes(code: string): string {
  return code.replace(MERGED_TAG_ATTR, '<$1 $2');
}

export function hasMergedJsxTagAttributes(code: string): boolean {
  MERGED_TAG_ATTR.lastIndex = 0;
  return MERGED_TAG_ATTR.test(code);
}

/** Ensures open-tag attributes start with whitespace when non-empty. */
export function formatOpenTagAttrs(attrs: string): string {
  if (!attrs?.trim()) {
    return '';
  }
  return /^\s/.test(attrs) ? attrs : ` ${attrs.trim()}`;
}
