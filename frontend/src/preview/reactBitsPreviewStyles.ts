/** CSS required by ReactBits components in the preview iframe (layout + canvas). */
export const REACTBITS_PREVIEW_STYLES = `
html, body, #root {
  background-color: #0b0b0b;
}

.reactbits-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.reactbits-bg > * {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
}

.reactbits-bg canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

#root > div.relative,
#root > div[class*="min-h-screen"] {
  position: relative;
  z-index: 1;
}

#root section,
#root main,
#root header,
#root footer,
#root nav {
  position: relative;
  z-index: 1;
}
`.trim();
