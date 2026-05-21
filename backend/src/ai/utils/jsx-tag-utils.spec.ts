import {
  fixMergedJsxTagAttributes,
  formatOpenTagAttrs,
  hasMergedJsxTagAttributes,
} from './jsx-tag-utils';
import { enforceUnifiedVisualMode } from './fix-ui-design';

describe('fixMergedJsxTagAttributes', () => {
  it('fixes navclassName', () => {
    const input = '<navclassName="fixed top-5">Logo</nav>';
    expect(fixMergedJsxTagAttributes(input)).toBe(
      '<nav className="fixed top-5">Logo</nav>',
    );
  });

  it('fixes buttonclassName', () => {
    const input = '<buttonclassName="rounded-full">Go</button>';
    expect(fixMergedJsxTagAttributes(input)).toContain('<button className=');
  });

  it('detects merged tags', () => {
    expect(hasMergedJsxTagAttributes('<navclassName="x">')).toBe(true);
    expect(hasMergedJsxTagAttributes('<nav className="x">')).toBe(false);
  });
});

describe('formatOpenTagAttrs', () => {
  it('adds leading space when attrs lack it', () => {
    expect(formatOpenTagAttrs('className="foo"')).toBe(' className="foo"');
  });

  it('preserves existing leading space', () => {
    expect(formatOpenTagAttrs(' className="foo"')).toBe(' className="foo"');
  });
});

describe('nav strip does not merge tag with className', () => {
  it('keeps space after nav when stripping backdrop-blur from className', () => {
    const code = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <nav className="backdrop-blur-[14px] saturate-[160%] flex gap-8 rounded-full px-5">
        <span>Logo</span>
      </nav>
      <section className="min-h-[100svh] py-16"><h1 className="text-4xl font-bold">Hi</h1></section>
    </div>
  );
}`;
    const fixed = enforceUnifiedVisualMode(code, 'dark');
    expect(fixed).not.toMatch(/<navclassName/i);
    expect(fixed).toMatch(/<nav\s+className=/);
    expect(fixed).not.toMatch(/className="\[14px\]/);
  });
});
