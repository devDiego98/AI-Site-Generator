import { PREVIEW_GENERIC_ERROR_MESSAGE } from '@/preview/previewErrorDisplay'

export const PREVIEW_RENDER_ERROR_TOAST = PREVIEW_GENERIC_ERROR_MESSAGE

export interface PreviewRenderErrorDetail {
  message: string
  stack?: string
}

export function reportPreviewRenderError(
  detail: PreviewRenderErrorDetail,
  showToast: (message: string) => void,
): void {
  console.error(
    '[Preview render error]',
    detail.message,
    detail.stack ?? '(no stack — if the message is "Script error.", the failure may be in a cross-origin script)',
  )
  showToast(PREVIEW_RENDER_ERROR_TOAST)
}
