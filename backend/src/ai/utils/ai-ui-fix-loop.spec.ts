import { countHighOpacityBackgrounds } from './design-tokens';
import { buildDesignFixUserMessage } from './design-fix-prompt';
import { evaluateUiDesign } from './evaluate-ui-design';
import { prepareUiCode } from './validate-ui-code';

describe('countHighOpacityBackgrounds', () => {
  it('allows bg-white/70 with blur on light mode cards', () => {
    const code = `<Card className="backdrop-blur-[14px] bg-white/70 border border-black/[0.07]">`;
    expect(countHighOpacityBackgrounds(code, 'light')).toBe(0);
  });

  it('flags bg-white/70 without blur on light mode', () => {
    const code = `<div className="bg-white/70">`;
    expect(countHighOpacityBackgrounds(code, 'light')).toBe(1);
  });

  it('flags bg-white/70 on dark mode cards', () => {
    const code = `<Card className="backdrop-blur-[14px] bg-white/70">`;
    expect(countHighOpacityBackgrounds(code, 'dark')).toBe(1);
  });

  it('allows bg-white/5 on dark mode cards', () => {
    const code = `<Card className="backdrop-blur-[14px] bg-white/5 border border-white/[0.09]">`;
    expect(countHighOpacityBackgrounds(code, 'dark')).toBe(0);
  });
});

describe('buildDesignFixUserMessage', () => {
  it('includes the validation error text', () => {
    const msg = buildDesignFixUserMessage('- [structure] example issue');
    expect(msg).toContain('example issue');
    expect(msg).toContain('Floating pill navbar');
    expect(msg).toContain('NEVER inside Card');
  });
});

describe('prepareUiCode minimal layout', () => {
  it('passes light pages with transparent sections and glass cards only', () => {
    const input = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#f5f5f2] text-[#111111]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><SoftAurora /></div>
      <div className="relative z-[1] min-h-screen">
        <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[1120px] flex h-[52px] items-center justify-between rounded-full px-5 backdrop-blur-[20px] bg-white/65 border border-black/[0.08]">
          <span className="shrink-0">Home</span>
          <div className="flex-1 flex justify-center" />
          <button type="button" className="shrink-0 rounded-full bg-[#111111] text-white px-4">Sign up</button>
        </nav>
        <section className="min-h-[100svh] flex flex-col items-center justify-center text-center pt-20">
          <h1 className="text-4xl font-bold text-[#111111]">Hello</h1>
        </section>
        <section className="py-16 px-4 max-w-[1120px] mx-auto">
          <Card className="backdrop-blur-[14px] bg-white/70 border border-black/[0.07] rounded-[14px] p-5 shadow-none">
            <p className="text-black/50">Body</p>
          </Card>
        </section>
      </div>
    </div>
  );
}`;
    const { validation } = prepareUiCode(input);
    expect(validation.valid).toBe(true);
  });

  it('fails when section is wrapped in glass before auto-fix', () => {
    const input = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#f5f5f2]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><SoftAurora /></div>
      <section className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg p-8">
        <h2>Title</h2>
      </section>
    </div>
  );
}`;
    const beforeFix = evaluateUiDesign(input);
    expect(beforeFix.passed).toBe(false);
    expect(
      beforeFix.issues.some((i) => i.message.includes('card-style surfaces')),
    ).toBe(true);

    const { validation } = prepareUiCode(input);
    expect(validation.valid).toBe(true);
  });
});
