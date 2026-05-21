#!/usr/bin/env node
/**
 * Regenerates AI ReactBits files from component .tsx default props (no backgroundDefaults.json).
 *
 * Run: node scripts/generate-reactbits-ai.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatDefaultsTable,
  loadReactBitsCatalog,
} from './lib/reactbits-defaults.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REACT_BITS_DIR = path.join(__dirname, '../frontend/src/ReactBits');
const CATALOG_OUT = path.join(
  __dirname,
  '../backend/src/ai/prompts/reactbits-background-catalog.ts',
);
const USAGE_OUT = path.join(
  __dirname,
  '../backend/src/ai/reactbits-background-usage.ts',
);

function kebabCase(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function writeCatalog(manifest, catalog) {
  const defaultLines = [];
  const wrapperLines = [];

  for (const name of manifest.components) {
    const entry = catalog[name] ?? {
      defaults: {},
      colorProps: [],
      usage: `<${name} />`,
    };
    defaultLines.push(
      `- ${name}: defaults { ${formatDefaultsTable(entry.defaults)} } | color props only: ${entry.colorProps.length ? entry.colorProps.join(', ') : '(none — use bare tag)'}`,
    );

    const wrapper = manifest.wrappers?.find((w) => w.name === name);
    const containerClass =
      wrapper?.containerClass ?? `${kebabCase(name)}-container`;
    wrapperLines.push(
      `- ${name}: container .${containerClass} — ${entry.usage}`,
    );
  }

  const output = `/** Auto-generated from ReactBits .tsx sources — run: node scripts/generate-reactbits-ai.mjs */
export const REACTBITS_LIBRARY_CATALOG = \`
=== REACTBITS LIBRARY (backgrounds — REQUIRED) ===
Animated page backgrounds from reactbits.dev. All components are pre-installed globals — use directly, NO imports, NO inlining, NO third-party background libs.

MANDATORY: Every UI MUST include at least one ReactBits background.
FORBIDDEN: ColorBends, GridPattern, DotPattern, Spotlight, BackgroundLayer, custom canvas/CSS backgrounds, import statements.

=== BACKGROUND PROP RULES (strict) ===
Every ReactBits component ships with built-in default values for ALL props (speed, size, intensity, counts, etc.).
When writing JSX you MUST:
1. Use the bare component with NO props when defaults look fine, OR
2. Pass ONLY color-related props tuned to the user's brand/theme (hex arrays/strings, hue, saturation, gradient colors, lineColor, raysColor, etc.).
NEVER pass non-color props (speed, amplitude, density, mouseForce, resolution, bandHeight, counts, booleans, sizes, etc.) — those always use library defaults.
If a component has no color props, use <ComponentName /> with zero attributes.

=== BACKGROUND SELECTION (required — read the user prompt first) ===
Before writing code, infer the site's subject, industry, and mood from the user's prompt.
Pick exactly ONE ReactBits background that visually reinforces that theme — never a random default.

Selection process:
1. Read the user prompt for industry, product, audience, and emotional tone.
2. Choose the single best-matching component from the catalog (examples below).
3. Customize ONLY color props to match the brand palette when the prompt implies colors (e.g. cyan/green for telecom, warm gold for luxury).

Theme → background (use when the prompt fits):
- Fiber optic / telecom / networking / ISP / broadband / data cables / connectivity → Hyperspeed, LaserFlow
- AI / ML / futuristic tech / startups → Aurora, LiquidEther, PrismaticBurst, LightRays
- SaaS / B2B software / dashboards / analytics → Hyperspeed, GridScan, DotGrid
- Finance / fintech / banking → Galaxy, Aurora, DarkVeil
- Wellness / spa / meditation / yoga → SoftAurora, FloatingLines, Grainient
- Creative agency / portfolio / design studio → Ribbons, PrismaticBurst, Particles, Iridescence
- Gaming / entertainment → Hyperspeed, PixelSnow, Plasma
- Space / astronomy / science → Galaxy, Aurora, LightRays
- Cybersecurity / hacker / dark tech → DarkVeil, GridScan, Hyperspeed
- Events / conferences / meetups → Aurora, LightRays, LiquidEther
- Education / courses / learning → Aurora, FloatingLines
- Healthcare / medical → SoftAurora, FloatingLines (calm, trustworthy)
- Real estate / luxury / premium brands → LightPillar, PrismaticBurst, Iridescence
- E-commerce / retail (playful) → Ribbons, SplashCursor, Particles
- Nature / eco / sustainability → Grainient, SoftAurora (green-tinted color props)
- Music / audio → Ribbons, Orb, PlasmaWave

Fallback by vibe (only when no clear industry match):
- Hero / landing / premium → LiquidEther, Aurora, PrismaticBurst, LightRays
- Tech / SaaS / dashboard → Hyperspeed, GridScan, LaserFlow
- Calm / wellness → SoftAurora, FloatingLines, Grainient
- Playful / creative → Ribbons, Particles, PrismaticBurst
- Dark / moody → DarkVeil, Galaxy, Plasma
- Interactive → LiquidEther, DotGrid, SplashCursor

Built-in defaults per component (from component source — do not repeat non-color props in JSX):
${defaultLines.join('\n')}

Per-component usage (color props only when customizing palette):
${wrapperLines.join('\n')}

=== PAGE SHELL (pick light OR dark from prompt — not always dark) ===
Place the background ONCE outside page routing — same background for all pages.

Light shell example:
<div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
  <div className="reactbits-bg absolute inset-0 z-0"><SoftAurora color1={'#e0f2fe'} color2={'#a5f3fc'} /></div>
  <main className="relative z-10">{/* nav + sections */}</main>
</div>

Dark shell example:
<div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
  <div className="reactbits-bg absolute inset-0 z-0"><LiquidEther colors={["#0ea5e9","#6366f1"]} /></div>
  <main className="relative z-10">{/* nav + sections */}</main>
</div>

Rules for reactbits-bg wrapper:
- className="reactbits-bg absolute inset-0 z-0" — fills viewport behind content
- Put exactly ONE background component inside
- Foreground MUST use relative z-10 (or higher)
- Light mode: page bg-white/slate-50, cards bg-white border shadow; tune background color props for light surfaces
- Dark mode: page bg-slate-950/#020617, glass cards bg-white/5 backdrop-blur border-white/10
- Match shell to GENERATION BRIEF visual mode — wellness/education/healthcare often light; gaming/cyber often dark
- SoftAurora bandHeight is internal — never pass bandHeight in generated JSX
\`.trim();

/** @deprecated Use REACTBITS_LIBRARY_CATALOG */
export const REACTBITS_BACKGROUND_CATALOG = REACTBITS_LIBRARY_CATALOG;
`;

  await fs.writeFile(CATALOG_OUT, output, 'utf8');
  console.log(`Wrote ${CATALOG_OUT}`);
}

async function writeUsage(manifest, catalog) {
  const names = [...manifest.components].sort();
  const usageEntries = names
    .map((name) => {
      const usage = catalog[name]?.usage ?? `<${name} />`;
      return `  ${name}: ${JSON.stringify(usage)},`;
    })
    .join('\n');

  const output = `/** Auto-generated from ReactBits .tsx sources — run: node scripts/generate-reactbits-ai.mjs */
export const REACTBITS_BACKGROUND_NAMES = [
${names.map((n) => `  '${n}',`).join('\n')}
] as const;

export type ReactBitsBackgroundName = (typeof REACTBITS_BACKGROUND_NAMES)[number];

/** Default JSX per component — color props only, non-color props use component defaults. */
export const REACTBITS_BACKGROUND_USAGE: Record<
  ReactBitsBackgroundName,
  string
> = {
${usageEntries}
};
`;

  await fs.writeFile(USAGE_OUT, output, 'utf8');
  console.log(`Wrote ${USAGE_OUT} (${names.length} components)`);
}

async function main() {
  const manifest = JSON.parse(
    await fs.readFile(path.join(REACT_BITS_DIR, 'manifest.json'), 'utf8'),
  );
  const catalog = await loadReactBitsCatalog(
    REACT_BITS_DIR,
    manifest.components,
  );
  await writeCatalog(manifest, catalog);
  await writeUsage(manifest, catalog);
}

main();
