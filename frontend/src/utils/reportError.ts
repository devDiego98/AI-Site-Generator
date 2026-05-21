const GENERIC_GENERATION_ERROR =
  "We couldn't generate your page. Please try again or adjust your prompt."

const GENERIC_MODIFICATION_ERROR =
  "We couldn't update your page. Please try again or adjust your request."

export function reportGenerationError(
  err: unknown,
  showToast: (message: string) => void,
): void {
  console.error(err)
  showToast(GENERIC_GENERATION_ERROR)
}

export function reportModificationError(
  err: unknown,
  showToast: (message: string) => void,
): void {
  console.error(err)
  showToast(GENERIC_MODIFICATION_ERROR)
}
