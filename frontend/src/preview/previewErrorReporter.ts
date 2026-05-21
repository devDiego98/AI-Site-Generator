import { getPreviewErrorFallbackRenderExpr } from '@/preview/previewErrorDisplay'

/** postMessage type from preview iframe → parent app */
export const PREVIEW_ERROR_MESSAGE_TYPE = 'ai-ui-builder-preview-error'

export const PREVIEW_ERROR_REPORTER_SCRIPT = `
(function () {
  window.__reportPreviewError = function (payload) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          Object.assign({ type: '${PREVIEW_ERROR_MESSAGE_TYPE}' }, payload || {}),
          '*',
        );
      }
    } catch (e) {}
  };
})();
`.trim()

/** React error boundary injected before generated component render. */
export function buildPreviewErrorBoundaryScript(componentName: string): string {
  return `
class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error };
  }
  componentDidCatch(error, info) {
    if (typeof window.__reportPreviewError === 'function') {
      window.__reportPreviewError({
        message: error && error.message ? error.message : String(error),
        stack:
          (error && error.stack) ||
          (info && info.componentStack ? String(info.componentStack) : undefined),
      });
    }
  }
  render() {
    if (this.state.error) {
      return ${getPreviewErrorFallbackRenderExpr()};
    }
    return this.props.children;
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(
    PreviewErrorBoundary,
    null,
    React.createElement(${componentName}),
  ),
);
`.trim()
}
