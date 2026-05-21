/** Lucide-style SVG icons exposed as globals in the preview iframe (no imports). */

export const LUCIDE_ICON_NAMES = [
  'Check',
  'X',
  'ChevronDown',
  'ChevronRight',
  'ChevronLeft',
  'ChevronUp',
  'ArrowRight',
  'ArrowLeft',
  'Plus',
  'Minus',
  'Star',
  'CircleCheck',
  'CheckCircle2',
  'Search',
  'Menu',
  'Mail',
  'User',
  'Users',
  'Loader2',
  'Sparkles',
  'Zap',
] as const

export function getLucideIconsRuntimeScript(): string {
  return `
function createLucideIcon(paths, circles) {
  return function LucideIcon({ className, size = 24, ...props }) {
    const dimension = typeof size === 'number' ? size : 24;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('lucide', className)}
        aria-hidden={props['aria-label'] ? undefined : true}
        {...props}
      >
        {(paths || []).map((d, i) => (
          <path key={'p' + i} d={d} />
        ))}
        {(circles || []).map((c, i) => (
          <circle key={'c' + i} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
      </svg>
    );
  };
}

const Check = createLucideIcon(['M20 6 9 17l-5-5']);
const X = createLucideIcon(['M18 6 6 18', 'M6 6l12 12']);
const ChevronDown = createLucideIcon(['m6 9 6 6 6-6']);
const ChevronRight = createLucideIcon(['m9 18 6-6-6-6']);
const ChevronLeft = createLucideIcon(['m15 18-6-6 6-6']);
const ChevronUp = createLucideIcon(['m18 15-6-6-6 6']);
const ArrowRight = createLucideIcon(['M5 12h14', 'm12 5 7 7-7 7']);
const ArrowLeft = createLucideIcon(['m12 19-7-7 7-7', 'M19 12H5']);
const Plus = createLucideIcon(['M5 12h14', 'M12 5v14']);
const Minus = createLucideIcon(['M5 12h14']);
const Star = createLucideIcon(['M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z']);
const CircleCheck = createLucideIcon(['m9 12 2 2 4-4'], [{ cx: 12, cy: 12, r: 10 }]);
const CheckCircle2 = CircleCheck;
const Search = createLucideIcon(['m21 21-4.34-4.34', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z']);
const Menu = createLucideIcon(['M4 12h16', 'M4 6h16', 'M4 18h16']);
const Mail = createLucideIcon(['m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7', 'M22 7v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7']);
const User = createLucideIcon(['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0']);
const Users = createLucideIcon(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M16 3.128a4 4 0 0 1 0 7.744', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M9 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0']);
const Loader2 = createLucideIcon(['M21 12a9 9 0 1 1-6.219-8.56']);
const Sparkles = createLucideIcon(['M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z', 'M20 2v4', 'M22 4h-4', 'M4 18v2', 'M5 19H3']);
const Zap = createLucideIcon(['M4 14a1 1 0 0 1 .78-1.63l9.9-3.9a1 1 0 0 1 1.32 1.32l-3.9 9.9A1 1 0 0 1 13 21h-1a1 1 0 0 1-.78-1.63l1.72-4.32L4 14z']);
`.trim()
}

export function getLucideIconsGlobalsExposeScript(): string {
  return `
if (typeof window !== 'undefined') {
  const __lucideNames = ${JSON.stringify(LUCIDE_ICON_NAMES)};
  __lucideNames.forEach((name) => {
    try {
      const ref = eval(name);
      if (ref !== undefined) window[name] = ref;
    } catch (_) {}
  });
}
`.trim()
}
