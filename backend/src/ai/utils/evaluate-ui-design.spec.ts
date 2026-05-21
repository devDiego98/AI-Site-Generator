import {
  evaluateUiDesign,
  formatDesignEvaluationError,
  hasNestedCards,
} from './evaluate-ui-design';
import { runDesignQualityPipeline } from './fix-ui-design';
import { prepareUiCode } from './validate-ui-code';

const DARK_PAGE_WITH_BAD_CONTRAST = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="reactbits-bg absolute inset-0 z-0"><Aurora /></div>
      <main className="relative z-10">
        <section>
          <h2 className="text-slate-900 font-bold">Who It's For</h2>
          <p className="text-slate-900">Our academy is designed for makers.</p>
        </section>
        <section className="bg-white py-12">
          <h2 className="text-slate-900">What You'll Achieve</h2>
          <ul><li>Item one</li><li>Item two</li></ul>
        </section>
      </main>
    </div>
  );
}`;

const GOOD_DARK_PAGE = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <div className="relative z-[1] min-h-screen">
        <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[1120px] flex h-[52px] items-center justify-between gap-4 rounded-full px-5 backdrop-blur-[20px] bg-[#141414]/65 border border-white/10">
          <span className="shrink-0">Logo</span>
          <div className="hidden sm:flex flex-1 items-center justify-center gap-6" />
          <button type="button" className="shrink-0 rounded-full bg-white text-[#111111] px-5 min-h-[44px]">Sign up</button>
        </nav>
        <section className="min-h-[100svh] flex flex-col items-center justify-center text-center pt-20 px-4">
          <h1 className="text-4xl font-bold text-[#f0f0f0]">Academy</h1>
          <p className="text-white/50 mt-4">Learn 3D printing.</p>
        </section>
        <section className="py-16 px-4 max-w-[1120px] mx-auto">
          <Card className="backdrop-blur-[14px] bg-white/5 border border-white/[0.09] rounded-[14px] p-5 shadow-none">
            <p className="text-white/50">Feature card</p>
          </Card>
        </section>
      </div>
    </div>
  );
}`;

const SECTION_WRAPPED_IN_GLASS = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#f5f5f2]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><SoftAurora /></div>
      <section className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold">Bad</h2>
      </section>
    </div>
  );
}`;

const MULTI_CARD_GRID = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[1120px] flex justify-between rounded-full backdrop-blur-[14px] bg-white/5 px-5 py-3">
        <span className="shrink-0">Logo</span>
        <span className="shrink-0 rounded-full bg-white text-[#111111] px-4">CTA</span>
      </nav>
      <section className="min-h-[100svh] flex items-center justify-center py-16">
        <h1 className="text-4xl font-bold text-[#f0f0f0]">Hero</h1>
      </section>
      <section className="py-16 px-4 grid grid-cols-2 gap-4">
        <Card className="backdrop-blur-[14px] bg-white/5 rounded-[14px] shadow-none p-5">
          <p className="text-white/50">One</p>
        </Card>
        <Card className="backdrop-blur-[14px] bg-white/5 rounded-[14px] shadow-none p-5">
          <p className="text-white/50">Two</p>
        </Card>
      </section>
    </div>
  );
}`;

const NESTED_CARDS = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <Card className="backdrop-blur-[14px] bg-white/5 rounded-[14px] shadow-none p-5">
        <Card className="backdrop-blur-[14px] bg-white/5 rounded-[14px] shadow-none p-5">
          <p className="text-white/50">Inner</p>
        </Card>
      </Card>
    </div>
  );
}`;

describe('hasNestedCards', () => {
  it('returns false for sibling Cards', () => {
    expect(hasNestedCards(MULTI_CARD_GRID)).toBe(false);
  });

  it('returns true when a Card wraps another Card', () => {
    expect(hasNestedCards(NESTED_CARDS)).toBe(true);
  });

  it('ignores self-closing Cards', () => {
    expect(hasNestedCards('<Card className="x" /><Card className="y" />')).toBe(
      false,
    );
  });
});

describe('evaluateUiDesign', () => {
  it('passes pages with multiple sibling Cards in a grid', () => {
    const result = evaluateUiDesign(MULTI_CARD_GRID);
    expect(
      result.issues.some((i) => i.message.includes('Nested Card')),
    ).toBe(false);
    expect(result.passed).toBe(true);
  });

  it('fails navbar without max-width and justify-between', () => {
    const badNav = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex gap-8 rounded-full px-5">
        <span>Logo</span>
        <button className="rounded-full bg-[#141414] text-[#333]">Sign up</button>
      </nav>
      <section className="min-h-[100svh] py-16"><h1 className="text-4xl font-bold">Hi</h1></section>
    </div>
  );
}`;
    const result = evaluateUiDesign(badNav);
    expect(result.passed).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('justify-between')),
    ).toBe(true);
    expect(
      result.issues.some((i) => i.message.includes('unreadable text contrast')),
    ).toBe(true);
  });

  it('fails when Cards are actually nested', () => {
    const result = evaluateUiDesign(NESTED_CARDS);
    expect(result.passed).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('Nested Card')),
    ).toBe(true);
  });

  it('fails dark pages with dark text on dark sections', () => {
    const result = evaluateUiDesign(DARK_PAGE_WITH_BAD_CONTRAST);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.category === 'contrast')).toBe(true);
  });

  it('passes cinematic dark page with bare hero and glass card', () => {
    const result = evaluateUiDesign(GOOD_DARK_PAGE);
    expect(result.passed).toBe(true);
  });

  it('passes full-width sticky navbar (archetypes 1/2/3/5/6/7)', () => {
    const code = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <div className="relative z-[1]">
        <nav className="sticky top-0 z-[100] w-full border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-6">
            <span className="shrink-0 font-bold">Logo</span>
            <div className="hidden md:flex flex-1 items-center justify-center gap-6" />
            <button type="button" className="shrink-0 rounded-full bg-white text-[#111111] px-5">Get started</button>
          </div>
        </nav>
        <section className="min-h-screen flex items-center justify-center">
          <h1 className="text-4xl font-bold">Fleet logistics</h1>
        </section>
        <section className="py-16 px-6 max-w-[1200px] mx-auto">
          <Card className="bg-card/60 backdrop-blur-[14px] shadow-none p-5"><p>Feature</p></Card>
        </section>
      </div>
    </div>
  );
}`;
    const result = evaluateUiDesign(code);
    expect(result.passed).toBe(true);
    expect(
      result.issues.some((i) => i.message.includes('floating centered pill')),
    ).toBe(false);
  });

  it('fails when a content section uses card-style glass', () => {
    const result = evaluateUiDesign(SECTION_WRAPPED_IN_GLASS);
    expect(result.passed).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('card-style surfaces')),
    ).toBe(true);
  });

  it('formats errors for AI retry', () => {
    const result = evaluateUiDesign(DARK_PAGE_WITH_BAD_CONTRAST);
    const message = formatDesignEvaluationError(result);
    expect(message).toContain('Design quality check failed');
    expect(message).toContain('contrast');
  });
});

describe('runDesignQualityPipeline', () => {
  it('auto-fixes contrast and strips section glass then passes', () => {
    const withSectionGlass = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="reactbits-bg absolute inset-0 z-0"><Aurora /></div>
      <main className="relative z-10">
        <section className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 m-2">
          <h2 className="text-3xl font-bold text-slate-900">About</h2>
        </section>
      </main>
    </div>
  );
}`;
    const { code, evaluation, fixed } = runDesignQualityPipeline(withSectionGlass);
    expect(fixed).toBe(true);
    expect(evaluation.passed).toBe(true);
    const sectionMatches = code.match(/<section[^>]*>/g) ?? [];
    expect(sectionMatches.every((s) => !/backdrop-blur-xl/.test(s))).toBe(true);
    expect(code).toMatch(/reactbits-bg[^>]*fixed/);
  });

  it('keeps sections transparent and upgrades canvas to fixed', () => {
    const plainSections = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen text-white">
      <div className="reactbits-bg absolute inset-0 z-0"><Aurora /></div>
      <main className="relative z-10">
        <section className="py-8">
          <h2 className="text-3xl font-bold text-white">About</h2>
          <p>Body copy</p>
        </section>
        <section className="bg-white border p-4">
          <h2 className="text-3xl font-bold text-white">Featured</h2>
        </section>
      </main>
    </div>
  );
}`;
    const { code, evaluation } = runDesignQualityPipeline(plainSections);
    expect(evaluation.passed).toBe(true);
    expect(code).toMatch(/reactbits-bg[^>]*fixed/);
    const sectionMatches = code.match(/<section[^>]*>/g) ?? [];
    expect(sectionMatches.every((s) => !/backdrop-blur-xl/.test(s))).toBe(true);
  });

  it('removes white header band and uses pill nav on dark pages', () => {
    const mixedHeader = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="reactbits-bg absolute inset-0 z-0"><Aurora /></div>
      <header className="bg-white text-slate-900 py-4 w-full">
        <nav><a href="#">Home</a></nav>
      </header>
      <main className="relative z-10 px-4 py-6">
        <section className="py-12">
          <h1 className="text-primary">Title</h1>
        </section>
      </main>
    </div>
  );
}`;
    const { code, evaluation } = runDesignQualityPipeline(mixedHeader);
    expect(evaluation.passed).toBe(true);
    expect(code).toMatch(/left-1\/2/);
    expect(code).toMatch(/rounded-full/);
    expect(code).not.toMatch(/text-primary/);
  });
});

describe('prepareUiCode integration', () => {
  it('auto-fixes unreadable dark-on-dark CTA buttons', () => {
    const code = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Aurora /></div>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex gap-8 rounded-full px-5">
        <span>Logo</span>
        <button className="rounded-full bg-[#141414] text-[#333333] px-5">Sign up</button>
      </nav>
      <section className="min-h-[100svh] py-16"><h1 className="text-4xl font-bold text-[#f0f0f0]">Hi</h1></section>
    </div>
  );
}`;
    const { code: fixed, validation } = prepareUiCode(code);
    expect(validation.valid).toBe(true);
    expect(fixed).toMatch(/text-white/);
    expect(fixed).toMatch(/justify-between/);
    expect(fixed).toMatch(/max-w-\[1120px\]/);
  });

  it('passes design pipeline for fixable dark pages', () => {
    const { validation } = prepareUiCode(DARK_PAGE_WITH_BAD_CONTRAST);
    expect(validation.valid).toBe(true);
  });
});
