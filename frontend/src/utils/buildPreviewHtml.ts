import {
  getShadcnRuntimeScript,
  SHADCN_PREVIEW_THEME_DARK,
  SHADCN_TAILWIND_CONFIG,
} from '@/preview/shadcnRuntime'
import { getFramerMotionGlobalBindingsScript } from '@/preview/framerMotionGlobalNames'
import { getReactBitsGlobalBindingsScript } from '@/preview/reactBitsGlobalNames'
import {
  PREVIEW_ERROR_DISPLAY_STYLES,
  getPreviewErrorInnerHtml,
  getPreviewErrorRenderScript,
} from '@/preview/previewErrorDisplay'
import {
  buildPreviewErrorBoundaryScript,
  PREVIEW_ERROR_REPORTER_SCRIPT,
} from '@/preview/previewErrorReporter'
import { fixShadcnButtonTags } from '@/preview/fixShadcnButtonTags'
import { PREVIEW_NAVIGATION_GUARD_SCRIPT } from '@/preview/previewNavigationGuard'
import { REACTBITS_PREVIEW_STYLES } from '@/preview/reactBitsPreviewStyles'

const ROOT_COMPONENT_NAMES = ['GeneratedApp', 'GeneratedPage'] as const

function resolveComponentName(source: string): string {
  for (const name of ROOT_COMPONENT_NAMES) {
    if (new RegExp(`(?:export\\s+default\\s+)?function\\s+${name}\\b`).test(source)) {
      return name
    }
    if (new RegExp(`const\\s+${name}\\s*=`).test(source)) {
      return name
    }
  }

  const functionMatch = /function\s+(\w+)\s*\(/.exec(source)
  const constMatch = /const\s+(\w+)\s*=/.exec(source)
  return functionMatch?.[1] ?? constMatch?.[1] ?? 'GeneratedApp'
}

const PREVIEW_REACT_HOOKS_PRELUDE =
  'const { useState, useEffect, useRef, useMemo, useCallback } = React;\n'

/** Removes ref={ref} when ref was never defined (common AI mistake). */
function stripOrphanRefAttributes(source: string): string {
  if (!/\bref=\{ref\}/.test(source)) {
    return source
  }
  if (/\b(?:const|let|var)\s+ref\s*=\s*(?:useRef|React\.useRef)\s*\(/.test(source)) {
    return source
  }
  return source.replace(/\s*ref=\{ref\}/g, '')
}

const IS_IN_VIEW_DEF =
  /\b(?:const|let|var)\s+isInView\s*=\s*useInView\s*\(/

/** Injects useRef/useInView when isInView is referenced but never defined. */
function fixOrphanIsInView(source: string): string {
  if (!/\bisInView\b/.test(source) || IS_IN_VIEW_DEF.test(source)) {
    return source
  }

  const hooks = `  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
`

  let result = source.replace(
    /((?:export\s+default\s+)?function\s+Generated(?:App|Page)\s*\([^)]*\)\s*\{)/,
    `$1\n${hooks}`,
  )
  if (result === source) {
    result = source.replace(
      /(const\s+Generated(?:App|Page)\s*=\s*(?:\([^)]*\)\s*)?=>\s*\{)/,
      `$1\n${hooks}`,
    )
  }

  const sectionTag = /<section(\s[^>]*)>/g
  let match: RegExpExecArray | null
  while ((match = sectionTag.exec(result)) !== null) {
    const start = match.index
    const endTag = result.indexOf('</section>', start)
    if (endTag === -1) continue
    const chunk = result.slice(start, endTag)
    if (!/animate=\{isInView/.test(chunk)) continue
    if (/\bref=\{ref\}/.test(match[1])) return result
    const newTag = `<section ref={ref}${match[1]}>`
    return result.slice(0, start) + newTag + result.slice(start + match[0].length)
  }

  if (!/\bref=\{ref\}/.test(result)) {
    result = result.replace(/<section(\s)/, '<section ref={ref}$1')
  }
  return result
}

function prepareComponentSource(code: string): string {
  let source = fixShadcnButtonTags(
    fixOrphanIsInView(stripOrphanRefAttributes(code.trim())),
  )

  source = source.replace(/^import\s+.+from\s+['"].+['"];?\s*/gm, '')
  source = source.replace(/export\s+default\s+function\s+(\w+)/, 'function $1')
  source = source.replace(/export\s+default\s+/, '')

  const componentName = resolveComponentName(source)

  if (!source.includes('ReactDOM.createRoot')) {
    source += `\n${buildPreviewErrorBoundaryScript(componentName)}\n`
  }

  if (!/^const\s*\{\s*useRef/.test(source)) {
    source = PREVIEW_REACT_HOOKS_PRELUDE + source
  }

  return source
}

function escapeScriptContent(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script')
}

export interface PreviewHtmlOptions {
  /** App origin, e.g. http://localhost:5173 — loads preview runtime assets */
  assetsBaseUrl?: string
}

function resolveAssetsBaseUrl(options: PreviewHtmlOptions): string {
  return options.assetsBaseUrl?.replace(/\/$/, '') ?? ''
}

export function buildPreviewHtml(code: string, options: PreviewHtmlOptions = {}): string {
  const shadcnRuntime = escapeScriptContent(getShadcnRuntimeScript())
  const componentSource = escapeScriptContent(prepareComponentSource(code))
  const reactBitsBindings = escapeScriptContent(getReactBitsGlobalBindingsScript())
  const framerMotionBindings = escapeScriptContent(
    getFramerMotionGlobalBindingsScript(),
  )
  const assetsBaseUrl = resolveAssetsBaseUrl(options)

  const reactBitsBlock = assetsBaseUrl
    ? `  <script>window.process=window.process||{env:{NODE_ENV:"production"}};</script>
  <link rel="stylesheet" href="${assetsBaseUrl}/react-bits-preview.css" />
  <script src="${assetsBaseUrl}/react-bits-preview.iife.js"></script>
  <script>
${reactBitsBindings}
  </script>
  <script src="${assetsBaseUrl}/framer-motion-preview.iife.js"></script>
  <script>
${framerMotionBindings}
  </script>
`
    : `  <script>
document.getElementById('root').innerHTML=${JSON.stringify(getPreviewErrorInnerHtml())};
  </script>
`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>${escapeScriptContent(PREVIEW_NAVIGATION_GUARD_SCRIPT)}</script>
  <script>${escapeScriptContent(PREVIEW_ERROR_REPORTER_SCRIPT)}</script>
  <script>window.process=window.process||{env:{NODE_ENV:"production"}};</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>${SHADCN_TAILWIND_CONFIG}</script>
  <script crossorigin src="https://unpkg.com/umd-react@19.2.6/dist/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/umd-react@19.2.6/dist/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
  <script src="https://unpkg.com/recharts@2.15.0/umd/Recharts.js"></script>
  <script>
    (function () {
      if (typeof Recharts === 'undefined') return;
      window.Recharts = Recharts;
      var chartNames = ['BarChart','Bar','LineChart','Line','AreaChart','Area','PieChart','Pie','Cell','XAxis','YAxis','CartesianGrid','ResponsiveContainer','Legend','RadarChart','Radar','PolarGrid','PolarAngleAxis','PolarRadiusAxis','RadialBarChart','RadialBar','ReferenceLine','ReferenceArea'];
      chartNames.forEach(function (name) {
        if (Recharts[name]) window[name] = Recharts[name];
      });
    })();
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
${getPreviewErrorRenderScript()}
    function showPreviewError(message, stack) {
      if (typeof window.__reportPreviewError === 'function') {
        window.__reportPreviewError({ message: message, stack: stack });
      }
      renderPreviewErrorInRoot();
    }
    window.addEventListener('error', function (event) {
      var message = event.error && event.error.message ? event.error.message : event.message || 'Preview runtime error';
      var stack = event.error && event.error.stack ? event.error.stack : undefined;
      showPreviewError(message, stack);
    });
    window.addEventListener('unhandledrejection', function (event) {
      var reason = event.reason;
      var message = reason && reason.message ? reason.message : String(reason);
      var stack = reason && reason.stack ? reason.stack : undefined;
      showPreviewError(message, stack);
    });
  </script>
  <style>
    ${SHADCN_PREVIEW_THEME_DARK}
    ${REACTBITS_PREVIEW_STYLES}
    ${PREVIEW_ERROR_DISPLAY_STYLES}
    html, body, #root { min-height: 100vh; height: 100%; margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
${shadcnRuntime}
  </script>
${reactBitsBlock}  <script type="text/babel" data-presets="react">
try {
${componentSource}
} catch (error) {
  var message = error && error.message ? error.message : 'Failed to render generated UI';
  var stack = error && error.stack ? error.stack : undefined;
  if (typeof window.__reportPreviewError === 'function') {
    window.__reportPreviewError({ message: message, stack: stack });
  }
  renderPreviewErrorInRoot();
}
  </script>
</body>
</html>`
}
