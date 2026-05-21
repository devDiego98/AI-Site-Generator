import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const SAMPLE_WITH_AURORA = `function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div className="reactbits-bg absolute inset-0 z-0">
        <Aurora
          colorStops={["#24FF72", "#9D7CF9", "#00D8FF"]}
          amplitude={1.2}
          blend={0.5}
          speed={1}
        />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <h1 className="text-3xl font-semibold">ReactBits preview test</h1>
      </div>
    </div>
  );
}`

/** Minimal preview HTML — mirrors buildPreviewHtml structure for ReactBits smoke test. */
function buildMinimalPreviewHtml(code: string, assetsBaseUrl: string): string {
  const componentSource = `${code.trim()}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(GeneratedApp));`

  const reactBitsBindings = REACT_BITS_GLOBAL_NAMES.map(
    (name) => `var ${name} = globalThis[${JSON.stringify(name)}];`,
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <script>window.process=window.process||{env:{NODE_ENV:"production"}};</script>
  <script crossorigin src="https://unpkg.com/umd-react@19.2.6/dist/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/umd-react@19.2.6/dist/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="${assetsBaseUrl}/react-bits-preview.css" />
  <style>
    html, body, #root { min-height: 100vh; height: 100%; margin: 0; background: #020617; }
    .reactbits-bg { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
    .reactbits-bg > * { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="${assetsBaseUrl}/react-bits-preview.iife.js"></script>
  <script>
(function () {
  if (typeof globalThis.Aurora === 'undefined') {
    throw new Error('ReactBits preview runtime failed to load');
  }
  ${reactBitsBindings}
})();
  </script>
  <script type="text/babel" data-presets="react">
try {
${componentSource}
} catch (error) {
  document.getElementById('root').innerHTML =
    '<pre style="padding:1rem;color:#b91c1c;white-space:pre-wrap;">' +
    (error && error.message ? error.message : 'Render failed') + '</pre>';
}
  </script>
</body>
</html>`
}

const REACT_BITS_GLOBAL_NAMES = ['Aurora', 'Galaxy', 'LiquidEther'] as const

function startStaticServer(previewHtml: string) {
  const publicDir = join(rootDir, 'public')
  const server = createServer((req, res) => {
    if (req.url === '/test-preview' || req.url === '/test-preview/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(previewHtml)
      return
    }
    const url = req.url === '/' ? '/index.html' : (req.url ?? '/')
    const filePath = join(publicDir, url.split('?')[0].replace(/^\//, ''))
    if (!existsSync(filePath)) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    const ext = filePath.split('.').pop()
    const types: Record<string, string> = {
      js: 'text/javascript',
      css: 'text/css',
      html: 'text/html',
    }
    res.writeHead(200, { 'Content-Type': types[ext ?? ''] ?? 'application/octet-stream' })
    res.end(readFileSync(filePath))
  })
  return new Promise<ReturnType<typeof createServer>>((resolve) =>
    server.listen(4173, '127.0.0.1', () => resolve(server)),
  )
}

async function main() {
  const html = buildMinimalPreviewHtml(SAMPLE_WITH_AURORA, 'http://127.0.0.1:4173')
  const server = await startStaticServer(html)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  try {
    await page.goto('http://127.0.0.1:4173/test-preview', {
      waitUntil: 'networkidle',
      timeout: 90_000,
    })
    await page.waitForTimeout(2500)

    const rootHtml = await page.locator('#root').innerHTML()
    const rootChildCount = await page.locator('#root *').count()
    const hasHeading = await page
      .locator('#root h1')
      .isVisible()
      .catch(() => false)

    if (!rootHtml.trim() || rootChildCount === 0) {
      console.error('FAIL: #root is empty')
      console.error('Console errors:', consoleErrors.slice(0, 10))
      process.exit(1)
    }
    if (!hasHeading) {
      console.error('FAIL: expected heading in #root')
      console.error('root snippet:', rootHtml.slice(0, 500))
      console.error('Console errors:', consoleErrors.slice(0, 10))
      process.exit(1)
    }

    console.log('PASS: #root has content (%d nodes)', rootChildCount)
    console.log('PASS: heading visible:', hasHeading)
    console.log('INFO: WebGL canvas present:', (await page.locator('#root canvas').count()) > 0)
    if (consoleErrors.length) {
      console.warn('WARN: console errors:', consoleErrors.slice(0, 5))
    }
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
