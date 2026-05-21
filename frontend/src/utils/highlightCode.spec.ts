import { describe, expect, it } from 'vitest'
import { highlightTsxCode } from './highlightCode'

describe('highlightTsxCode', () => {
  it('wraps keywords and escapes HTML', () => {
    const result = highlightTsxCode('const x = <div>&</div>')
    expect(result).toContain('hl-keyword')
    expect(result).toContain('const')
    expect(result).toContain('&amp;')
  })
})
