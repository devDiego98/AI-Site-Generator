import { findJsxOpenTagClose } from '@/preview/jsxTagUtils'

const SHADCN_SIZE_VALUE =
  /^\s*=\s*(?:"(?:sm|lg|icon|default)"|'(?:sm|lg|icon|default)'|\{(?:\s*['"]?(?:sm|lg|icon|default)['"]?\s*)\})\s*/

/**
 * AI often emits `<button variant="ghost" size="sm">` instead of shadcn `<Button>`.
 * Native buttons ignore those props; the preview runtime only styles the `Button` component.
 */
export function isShadcnStyleButtonAttrs(attrs: string): boolean {
  if (/\bvariant\s*=/.test(attrs)) {
    return true
  }
  const sizeMatch = attrs.match(/\bsize\b/)
  if (sizeMatch && SHADCN_SIZE_VALUE.test(attrs.slice(sizeMatch.index! + 4))) {
    return true
  }
  return false
}

function formatOpenAttrs(attrs: string): string {
  const trimmed = attrs.trim()
  if (!trimmed) {
    return ''
  }
  return /^\s/.test(attrs) ? attrs : ` ${trimmed}`
}

/**
 * Rewrites lowercase `<button variant|size …>` opens/closes to `<Button>` / `</Button>`.
 * Leaves nav controls (`type="button"` + onClick, no variant) as native `<button>`.
 */
export function fixShadcnButtonTags(code: string): string {
  if (!/<button(?=\s|>)/.test(code)) {
    return code
  }

  interface TagEvent {
    index: number
    kind: 'open' | 'close'
    length: number
    attrs?: string
    selfClosing?: boolean
  }

  const events: TagEvent[] = []

  const openRe = /<button(?=\s|>)/g
  let match: RegExpExecArray | null
  while ((match = openRe.exec(code)) !== null) {
    const nameEnd = match.index + match[0].length
    const closeIdx = findJsxOpenTagClose(code, nameEnd)
    if (closeIdx === -1) {
      continue
    }
    const selfClosing = code[closeIdx + 1] === '/'
    events.push({
      index: match.index,
      kind: 'open',
      attrs: code.slice(nameEnd, closeIdx),
      length: closeIdx - match.index + (selfClosing ? 2 : 1),
      selfClosing,
    })
  }

  const closeRe = /<\/button\s*>/gi
  while ((match = closeRe.exec(code)) !== null) {
    events.push({
      index: match.index,
      kind: 'close',
      length: match[0].length,
    })
  }

  events.sort((a, b) => a.index - b.index)

  const replacements: { start: number; end: number; text: string }[] = []
  const stack: ('button' | 'Button')[] = []

  for (const event of events) {
    if (event.kind === 'open') {
      const useShadcn = isShadcnStyleButtonAttrs(event.attrs ?? '')
      const tag = useShadcn ? 'Button' : 'button'
      if (!event.selfClosing) {
        stack.push(tag)
      }
      const close = event.selfClosing ? ' />' : '>'
      replacements.push({
        start: event.index,
        end: event.index + event.length,
        text: `<${tag}${formatOpenAttrs(event.attrs ?? '')}${close}`,
      })
      continue
    }

    const tag = stack.pop() ?? 'button'
    replacements.push({
      start: event.index,
      end: event.index + event.length,
      text: `</${tag}>`,
    })
  }

  let result = code
  for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
    result = result.slice(0, replacement.start) + replacement.text + result.slice(replacement.end)
  }
  return result
}
