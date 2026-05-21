const IS_IN_VIEW_DEF =
  /\b(?:const|let|var)\s+isInView\s*=\s*useInView\s*\(/;

const GENERATED_APP_BODY =
  /((?:export\s+default\s+)?function\s+Generated(?:App|Page)\s*\([^)]*\)\s*\{)/;

/** True when JSX uses isInView but the component never defines it via useInView. */
export function hasOrphanIsInView(code: string): boolean {
  if (!/\bisInView\b/.test(code)) {
    return false;
  }
  return !IS_IN_VIEW_DEF.test(code);
}

function attachRefToAnimatedSection(code: string): string {
  const sectionTag = /<section(\s[^>]*)>/g;
  let match: RegExpExecArray | null;
  while ((match = sectionTag.exec(code)) !== null) {
    const start = match.index;
    const endTag = code.indexOf('</section>', start);
    if (endTag === -1) {
      continue;
    }
    const chunk = code.slice(start, endTag);
    if (!/animate=\{isInView/.test(chunk)) {
      continue;
    }
    if (/\bref=\{ref\}/.test(match[1])) {
      return code;
    }
    const newTag = `<section ref={ref}${match[1]}>`;
    return code.slice(0, start) + newTag + code.slice(start + match[0].length);
  }

  if (/\bref=\{ref\}/.test(code)) {
    return code;
  }
  return code.replace(/<section(\s)/, '<section ref={ref}$1');
}

/** Injects useRef/useInView and ref on the animated section when isInView is undefined. */
export function fixOrphanIsInView(code: string): string {
  if (!hasOrphanIsInView(code)) {
    return code;
  }

  const hooks = `  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
`;

  let result = code.replace(GENERATED_APP_BODY, `$1\n${hooks}`);
  if (result === code) {
    result = code.replace(
      /(const\s+Generated(?:App|Page)\s*=\s*(?:\([^)]*\)\s*)?=>\s*\{)/,
      `$1\n${hooks}`,
    );
  }

  return attachRefToAnimatedSection(result);
}
