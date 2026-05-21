import {
  fixMergedJsxTagAttributes,
  fixShadcnButtonTags,
  formatOpenTagAttrs,
  hasMergedJsxTagAttributes,
  replaceJsxOpenTags,
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

describe('fixShadcnButtonTags', () => {
  it('rewrites shadcn props on lowercase button to Button', () => {
    const input = `<nav>
      <button variant="ghost" size="sm" className="hidden md:flex">Login</button>
      <button size="sm" className="rounded-full">Join</button>
      <button type="button" onClick={() => setPage('home')}>Home</button>
    </nav>`;
    const output = fixShadcnButtonTags(input);
    expect(output).toContain('<Button variant="ghost" size="sm"');
    expect(output).toContain('<Button size="sm" className="rounded-full">Join</Button>');
    expect(output).toContain('<button type="button" onClick={() => setPage(\'home\')}>Home</button>');
  });
});

describe('replaceJsxOpenTags', () => {
  it('preserves onClick arrow functions with =>', () => {
    const input =
      '<button type="button" onClick={() => setCurrentPage("home")} className="underline">Home</button>';
    const output = replaceJsxOpenTags(input, 'button', (attrs) => attrs);
    expect(output).toBe(input);
    expect(output).toContain('onClick={() => setCurrentPage("home")}');
    expect(output).not.toMatch(/onClick=\{\(\)\s*=\s*className/);
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

describe('fixButtons preserves nav onClick handlers', () => {
  it('does not inject className into onClick when fixing contrast', () => {
    const code = `export default function GeneratedApp() {
  const [currentPage, setCurrentPage] = React.useState('home');
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <nav className="flex gap-6">
        <button type="button" onClick={() => setCurrentPage('home')} className={currentPage === 'home' ? 'underline' : ''}>Home</button>
        <button type="button" onClick={() => setCurrentPage('agenda')} className={currentPage === 'agenda' ? 'underline' : ''}>Agenda</button>
      </nav>
    </div>
  );
}`;
    const fixed = enforceUnifiedVisualMode(code, 'dark');
    expect(fixed).toContain("onClick={() => setCurrentPage('home')}");
    expect(fixed).toContain("onClick={() => setCurrentPage('agenda')}");
    expect(fixed).not.toMatch(/onClick=\{\(\)\s*=\s*className/);
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
