/** User-facing copy when preview render fails (iframe + parent toast). */
export const PREVIEW_GENERIC_ERROR_TITLE = "Couldn't preview this page"
export const PREVIEW_GENERIC_ERROR_MESSAGE =
  'Something went wrong while rendering the generated interface. Try regenerating or adjusting your prompt.'

const SANITIZED_ERROR_PATTERNS = [/^script error\.?$/i, /^error$/i]

/** Browser-reported cross-origin script failures surface as an unhelpful "Script error." */
export function isSanitizedPreviewErrorMessage(message: string): boolean {
  return SANITIZED_ERROR_PATTERNS.some((pattern) => pattern.test(message.trim()))
}

export const PREVIEW_ERROR_DISPLAY_STYLES = `
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 100vh;
  margin: 0;
  padding: 2rem;
  box-sizing: border-box;
  text-align: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fafafa;
  color: #18181b;
}
.preview-error__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.5rem;
  color: #71717a;
  background: #f4f4f5;
  border-radius: 9999px;
}
.preview-error__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}
.preview-error__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.35;
  color: #18181b;
}
.preview-error__message {
  margin: 0;
  max-width: 22rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #71717a;
}
`.trim()

const PREVIEW_ERROR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`

export function getPreviewErrorInnerHtml(): string {
  return `<div class="preview-error" role="alert">
  <div class="preview-error__icon">${PREVIEW_ERROR_ICON_SVG}</div>
  <h2 class="preview-error__title">${PREVIEW_GENERIC_ERROR_TITLE}</h2>
  <p class="preview-error__message">${PREVIEW_GENERIC_ERROR_MESSAGE}</p>
</div>`
}

/** Injected into preview iframe: replaces #root with the friendly error state. */
export function getPreviewErrorRenderScript(): string {
  const html = JSON.stringify(getPreviewErrorInnerHtml())
  return `
function renderPreviewErrorInRoot() {
  var root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = ${html};
}
`.trim()
}

/** React error-boundary fallback (same UI as renderPreviewErrorInRoot). */
export function getPreviewErrorFallbackRenderExpr(): string {
  const html = JSON.stringify(getPreviewErrorInnerHtml())
  return `React.createElement('div', {
    dangerouslySetInnerHTML: { __html: ${html} },
  })`
}
