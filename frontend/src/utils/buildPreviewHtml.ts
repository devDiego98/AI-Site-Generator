import {
  getShadcnRuntimeScript,
  SHADCN_PREVIEW_THEME_DARK,
  SHADCN_TAILWIND_CONFIG,
} from '@/preview/shadcnRuntime'
import { getFramerMotionGlobalBindingsScript } from '@/preview/framerMotionGlobalNames'
import { getReactBitsGlobalBindingsScript } from '@/preview/reactBitsGlobalNames'
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

function prepareComponentSource(code: string): string {
  let source = stripOrphanRefAttributes(code.trim())

  source = source.replace(/^import\s+.+from\s+['"].+['"];?\s*/gm, '')
  source = source.replace(/export\s+default\s+function\s+(\w+)/, 'function $1')
  source = source.replace(/export\s+default\s+/, '')

  const componentName = resolveComponentName(source)

  if (!source.includes('ReactDOM.createRoot')) {
    source += `
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(${componentName}));
`
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
document.getElementById('root').innerHTML='<pre style="padding:1rem;color:#b91c1c">Preview assets URL missing.</pre>';
  </script>
`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>${escapeScriptContent(PREVIEW_NAVIGATION_GUARD_SCRIPT)}</script>
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
    window.addEventListener('error', function (event) {
      var root = document.getElementById('root');
      if (!root || root.childNodes.length > 0) return;
      root.innerHTML =
        '<pre style="padding:1rem;color:#b91c1c;font-family:system-ui,sans-serif;white-space:pre-wrap;">' +
        (event.error && event.error.message ? event.error.message : event.message || 'Preview runtime error') +
        (event.error && event.error.stack ? '\\n\\n' + event.error.stack : '') +
        '</pre>';
    });
    window.addEventListener('unhandledrejection', function (event) {
      var root = document.getElementById('root');
      if (!root || root.childNodes.length > 0) return;
      var reason = event.reason;
      var message = reason && reason.message ? reason.message : String(reason);
      root.innerHTML =
        '<pre style="padding:1rem;color:#b91c1c;font-family:system-ui,sans-serif;white-space:pre-wrap;">' +
        message +
        (reason && reason.stack ? '\\n\\n' + reason.stack : '') +
        '</pre>';
    });
  </script>
  <style>
    ${SHADCN_PREVIEW_THEME_DARK}
    ${REACTBITS_PREVIEW_STYLES}
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
  document.getElementById('root').innerHTML =
    '<pre style="padding:1rem;color:#b91c1c;font-family:system-ui,sans-serif;white-space:pre-wrap;">' +
    (error && error.message ? error.message : 'Failed to render generated UI') +
    (error && error.stack ? '\\n\\n' + error.stack : '') +
    '</pre>';
}
  </script>
</body>
</html>`
}
