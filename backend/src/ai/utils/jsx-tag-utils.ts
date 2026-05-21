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

/**
 * Index of the `>` that closes a JSX open tag, searching from just after the tag name
 * (e.g. after `<button`). Respects quotes and `{...}` so `=>` in onClick is not treated
 * as the tag end.
 */
export function findJsxOpenTagClose(code: string, searchFrom: number): number {
  let braceDepth = 0;
  let quote: '"' | "'" | '`' | null = null;

  for (let i = searchFrom; i < code.length; i++) {
    const ch = code[i];
    const prev = code[i - 1];

    if (quote) {
      if (ch === quote && prev !== '\\') {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') {
      braceDepth++;
      continue;
    }

    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (ch === '>' && braceDepth === 0) {
      return i;
    }
  }

  return -1;
}

/** Replaces JSX open tags by tag name without breaking on `>` inside attribute expressions. */
export function replaceJsxOpenTags(
  code: string,
  tagName: string,
  replacer: (attrs: string) => string,
): string {
  const tagRe = new RegExp(`<${tagName}(?=\\s|>)`, 'gi');
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(code)) !== null) {
    const start = match.index;
    const nameEnd = start + match[0].length;
    const closeIdx = findJsxOpenTagClose(code, nameEnd);
    if (closeIdx === -1) {
      continue;
    }

    const attrs = code.slice(nameEnd, closeIdx);
    result += code.slice(lastIndex, start);
    result += `<${tagName}${replacer(attrs)}>`;
    lastIndex = closeIdx + 1;
    tagRe.lastIndex = lastIndex;
  }

  return result + code.slice(lastIndex);
}

const SHADCN_SIZE_VALUE =
  /^\s*=\s*(?:"(?:sm|lg|icon|default)"|'(?:sm|lg|icon|default)'|\{(?:\s*['"]?(?:sm|lg|icon|default)['"]?\s*)\})\s*/

export function isShadcnStyleButtonAttrs(attrs: string): boolean {
  if (/\bvariant\s*=/.test(attrs)) {
    return true;
  }
  const sizeMatch = attrs.match(/\bsize\b/);
  if (sizeMatch && SHADCN_SIZE_VALUE.test(attrs.slice(sizeMatch.index! + 4))) {
    return true;
  }
  return false;
}

/** `<button variant="ghost">` → `<Button>` so preview/runtime shadcn picks up props. */
export function fixShadcnButtonTags(code: string): string {
  if (!/<button(?=\s|>)/.test(code)) {
    return code;
  }

  interface TagEvent {
    index: number;
    kind: 'open' | 'close';
    length: number;
    attrs?: string;
    selfClosing?: boolean;
  }

  const events: TagEvent[] = [];
  const openRe = /<button(?=\s|>)/g;
  let match: RegExpExecArray | null;

  while ((match = openRe.exec(code)) !== null) {
    const nameEnd = match.index + match[0].length;
    const closeIdx = findJsxOpenTagClose(code, nameEnd);
    if (closeIdx === -1) {
      continue;
    }
    const selfClosing = code[closeIdx + 1] === '/';
    events.push({
      index: match.index,
      kind: 'open',
      attrs: code.slice(nameEnd, closeIdx),
      length: closeIdx - match.index + (selfClosing ? 2 : 1),
      selfClosing,
    });
  }

  const closeRe = /<\/button\s*>/gi;
  while ((match = closeRe.exec(code)) !== null) {
    events.push({
      index: match.index,
      kind: 'close',
      length: match[0].length,
    });
  }

  events.sort((a, b) => a.index - b.index);

  const replacements: { start: number; end: number; text: string }[] = [];
  const stack: ('button' | 'Button')[] = [];

  for (const event of events) {
    if (event.kind === 'open') {
      const useShadcn = isShadcnStyleButtonAttrs(event.attrs ?? '');
      const tag = useShadcn ? 'Button' : 'button';
      if (!event.selfClosing) {
        stack.push(tag);
      }
      const attrs = event.attrs ?? '';
      const formattedAttrs = attrs.trim() ? formatOpenTagAttrs(attrs) : '';
      const close = event.selfClosing ? ' />' : '>';
      replacements.push({
        start: event.index,
        end: event.index + event.length,
        text: `<${tag}${formattedAttrs}${close}`,
      });
      continue;
    }

    const tag = stack.pop() ?? 'button';
    replacements.push({
      start: event.index,
      end: event.index + event.length,
      text: `</${tag}>`,
    });
  }

  let result = code;
  for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
    result =
      result.slice(0, replacement.start) +
      replacement.text +
      result.slice(replacement.end);
  }
  return result;
}
