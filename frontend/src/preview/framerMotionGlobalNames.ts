/** Framer Motion APIs exposed in the preview iframe (keep in sync with framerMotionPreviewEntry.ts). */
export const FRAMER_MOTION_GLOBAL_NAMES = [
  'motion',
  'AnimatePresence',
  'useInView',
  'useScroll',
  'useTransform',
  'useSpring',
] as const

export function getFramerMotionGlobalBindingsScript(): string {
  const lines = FRAMER_MOTION_GLOBAL_NAMES.map(
    (name) => `var ${name} = globalThis[${JSON.stringify(name)}];`,
  )
  return `
(function () {
  if (typeof globalThis.motion === 'undefined') {
    throw new Error(
      'Framer Motion preview runtime failed to load. Run: npm run build:preview-runtime',
    );
  }
  ${lines.join('\n  ')}
})();
`.trim()
}
