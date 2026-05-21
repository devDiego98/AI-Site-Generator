/** True when JSX uses ref={ref} but the component never defines ref via useRef. */
export function hasOrphanRefAttribute(code: string): boolean {
  if (!/\bref=\{ref\}/.test(code)) {
    return false;
  }
  return !/\b(?:const|let|var)\s+ref\s*=\s*(?:useRef|React\.useRef)\s*\(/.test(
    code,
  );
}

/** Removes ref={ref} when ref is not defined (avoids ReferenceError in preview). */
export function stripOrphanRefAttributes(code: string): string {
  if (!hasOrphanRefAttribute(code)) {
    return code;
  }
  return code.replace(/\s*ref=\{ref\}/g, '');
}
