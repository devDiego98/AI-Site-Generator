import { describe, expect, it, vi } from 'vitest'
import { GenerateUiApiError } from '@/services/generateUiApi'
import { reportGenerationError } from './reportError'

describe('reportGenerationError', () => {
  it('surfaces validation failures from 502 responses', () => {
    const toast = vi.fn()
    const setInline = vi.fn()
    const err = new GenerateUiApiError('script tags are not allowed', 502)

    reportGenerationError(err, toast, setInline)

    expect(setInline).toHaveBeenCalledWith(
      expect.stringContaining("couldn't use safely"),
    )
    expect(toast).toHaveBeenCalled()
  })
})
