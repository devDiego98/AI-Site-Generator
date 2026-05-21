/**
 * JSX open-tag helpers (ported from backend jsx-tag-utils for preview fixes).
 */

export function findJsxOpenTagClose(code: string, searchFrom: number): number {
  let braceDepth = 0
  let quote: '"' | "'" | '`' | null = null

  for (let i = searchFrom; i < code.length; i++) {
    const ch = code[i]
    const prev = code[i - 1]

    if (quote) {
      if (ch === quote && prev !== '\\') {
        quote = null
      }
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }

    if (ch === '{') {
      braceDepth++
      continue
    }

    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1)
      continue
    }

    if (ch === '>' && braceDepth === 0) {
      return i
    }
  }

  return -1
}
