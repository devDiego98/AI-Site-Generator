/** Auto-generated from ReactBits .tsx sources — run: node scripts/generate-reactbits-ai.mjs */
export const REACTBITS_BACKGROUND_NAMES = [
  'Aurora',
  'DarkVeil',
  'DotGrid',
  'FloatingLines',
  'Galaxy',
  'Grainient',
  'GridScan',
  'Hyperspeed',
  'Iridescence',
  'LaserFlow',
  'LightPillar',
  'LightRays',
  'LiquidEther',
  'Orb',
  'Particles',
  'PixelSnow',
  'Plasma',
  'PlasmaWave',
  'Prism',
  'PrismaticBurst',
  'Ribbons',
  'SoftAurora',
  'SplashCursor',
  'Threads',
] as const;

export type ReactBitsBackgroundName =
  (typeof REACTBITS_BACKGROUND_NAMES)[number];

/** Default JSX per component — color props only, non-color props use component defaults. */
export const REACTBITS_BACKGROUND_USAGE: Record<
  ReactBitsBackgroundName,
  string
> = {
  Aurora: "<Aurora colorStops={['#5227FF', '#7cff67', '#5227FF']} />",
  DarkVeil: '<DarkVeil hueShift={0} />',
  DotGrid: "<DotGrid baseColor={'#5227FF'} activeColor={'#5227FF'} />",
  FloatingLines: '<FloatingLines />',
  Galaxy: '<Galaxy hueShift={140} saturation={0.0} />',
  Grainient:
    "<Grainient saturation={1.0} color1={'#FF9FFC'} color2={'#5227FF'} color3={'#B497CF'} />",
  GridScan: "<GridScan linesColor={'#2F293A'} scanColor={'#FF9FFC'} />",
  Hyperspeed: '<Hyperspeed />',
  Iridescence: '<Iridescence color={[1, 1, 1]} />',
  LaserFlow: "<LaserFlow color={'#FF79C6'} />",
  LightPillar: "<LightPillar topColor={'#5227FF'} bottomColor={'#FF9FFC'} />",
  LightRays: "<LightRays raysColor={'#ffffff'} saturation={1.0} />",
  LiquidEther: "<LiquidEther colors={['#5227FF', '#FF9FFC', '#B497CF']} />",
  Orb: "<Orb hue={0} backgroundColor={'#000000'} />",
  Particles: '<Particles />',
  PixelSnow: "<PixelSnow color={'#ffffff'} />",
  Plasma: "<Plasma color={'#ffffff'} />",
  PlasmaWave: "<PlasmaWave colors={['#A855F7', '#06B6D4']} />",
  Prism: '<Prism hueShift={0} />',
  PrismaticBurst: '<PrismaticBurst />',
  Ribbons:
    "<Ribbons colors={['#ff9346', '#7cff67', '#ffee51', '#5227FF']} backgroundColor={[0, 0, 0, 0]} />",
  SoftAurora: "<SoftAurora color1={'#f7f7f7'} color2={'#e100ff'} />",
  SplashCursor: "<SplashCursor COLOR={'#ff0000'} />",
  Threads: '<Threads color={[1, 1, 1]} />',
};
