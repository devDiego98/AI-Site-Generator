import { GenerateUiApiError } from '@/services/generateUiApi'

const GENERIC_GENERATION_ERROR =
  "We couldn't generate your page. Please try again or adjust your prompt."

const GENERIC_MODIFICATION_ERROR =
  "We couldn't update your page. Please try again or adjust your request."

function isValidationFailureMessage(message: string): boolean {
  return (
    /not allowed/i.test(message) ||
    /invalid ui code/i.test(message) ||
    /could not be rendered/i.test(message) ||
    /script tags/i.test(message) ||
    /must export/i.test(message)
  )
}

function formatGenerationError(err: unknown): string {
  if (err instanceof GenerateUiApiError) {
    if (err.statusCode === 503) {
      return 'The AI service is not configured on the server. Ask the operator to set AI_PROVIDER and AI_API_KEY.'
    }
    if (err.statusCode === 400) {
      return err.message
    }
    if (err.statusCode === 502 && isValidationFailureMessage(err.message)) {
      return `The AI returned code we couldn't use safely: ${err.message} Try regenerating or simplifying your prompt.`
    }
    if (err.statusCode === 502) {
      return err.message
    }
    return err.message
  }

  return GENERIC_GENERATION_ERROR
}

function formatModificationError(err: unknown): string {
  if (err instanceof GenerateUiApiError) {
    if (err.statusCode === 503) {
      return 'The AI service is not configured on the server.'
    }
    if (err.statusCode === 400) {
      return err.message
    }
    if (err.statusCode === 502 && isValidationFailureMessage(err.message)) {
      return `We couldn't apply that change: ${err.message} Try a smaller, more specific instruction.`
    }
    if (err.statusCode === 502) {
      return err.message
    }
    return err.message
  }

  return GENERIC_MODIFICATION_ERROR
}

export function reportGenerationError(
  err: unknown,
  showToast: (message: string) => void,
  setInlineError?: (message: string) => void,
): void {
  console.error(err)
  const message = formatGenerationError(err)
  setInlineError?.(message)
  showToast(message)
}

export function reportModificationError(
  err: unknown,
  showToast: (message: string) => void,
  setInlineError?: (message: string) => void,
): void {
  console.error(err)
  const message = formatModificationError(err)
  setInlineError?.(message)
  showToast(message)
}
