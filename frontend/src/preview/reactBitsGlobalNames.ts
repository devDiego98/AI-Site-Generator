/** ReactBits components exposed in the preview iframe (keep in sync with src/ReactBits/index.ts). */
export const REACT_BITS_GLOBAL_NAMES = [
  'Aurora',
  'SoftAurora',
  'Iridescence',
  'Threads',
  'Particles',
  'Ribbons',
  'Orb',
  'Hyperspeed',
  'GridScan',
  'DotGrid',
  'Grainient',
  'LiquidEther',
  'Plasma',
  'PlasmaWave',
  'Prism',
  'PrismaticBurst',
  'Galaxy',
  'PixelSnow',
  'DarkVeil',
  'FloatingLines',
  'LaserFlow',
  'LightRays',
  'LightPillar',
  'SplashCursor',
] as const

export function getReactBitsGlobalBindingsScript(): string {
  const lines = REACT_BITS_GLOBAL_NAMES.map(
    (name) => `var ${name} = globalThis[${JSON.stringify(name)}];`,
  )
  return `
(function () {
  if (typeof globalThis.LiquidEther === 'undefined') {
    throw new Error(
      'ReactBits preview runtime failed to load. Check the console for "process is not defined" or 404 on react-bits-preview.iife.js, then run: npm run build:preview-runtime',
    );
  }
  ${lines.join('\n  ')}
})();
`.trim()
}
