const KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|import|export|default|from|type|interface|class|extends|implements|new|typeof|void|null|undefined|true|false|async|await)\b/g

const JSX_TAG = /(<\/?)([A-Z][a-zA-Z0-9]*)/g
const STRING = /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/g
const COMMENT = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

type Span = { start: number; end: number; className: string }

function applySpans(source: string, spans: Span[]): string {
  const sorted = [...spans].sort((a, b) => a.start - b.start)
  let result = ''
  let cursor = 0

  for (const span of sorted) {
    if (span.start < cursor) {
      continue
    }
    result += escapeHtml(source.slice(cursor, span.start))
    result += `<span class="${span.className}">${escapeHtml(source.slice(span.start, span.end))}</span>`
    cursor = span.end
  }

  result += escapeHtml(source.slice(cursor))
  return result
}

function collectMatches(
  source: string,
  regex: RegExp,
  className: string,
  occupied: boolean[],
): Span[] {
  const spans: Span[] = []
  const re = new RegExp(regex.source, regex.flags)
  let match: RegExpExecArray | null

  while ((match = re.exec(source)) !== null) {
    const start = match.index
    const end = start + match[0].length
    if (occupied.slice(start, end).some(Boolean)) {
      continue
    }
    for (let i = start; i < end; i++) {
      occupied[i] = true
    }
    spans.push({ start, end, className })
  }

  return spans
}

/** Lightweight TSX syntax highlighting for the code panel (no extra deps). */
export function highlightTsxCode(code: string): string {
  const occupied = Array<boolean>(code.length).fill(false)
  const spans: Span[] = []

  spans.push(...collectMatches(code, COMMENT, 'hl-comment', occupied))
  spans.push(...collectMatches(code, STRING, 'hl-string', occupied))
  spans.push(...collectMatches(code, JSX_TAG, 'hl-tag', occupied))
  spans.push(...collectMatches(code, KEYWORDS, 'hl-keyword', occupied))

  return applySpans(code, spans)
}
