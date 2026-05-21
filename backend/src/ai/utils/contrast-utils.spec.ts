import {
  countLowContrastFilledControlsInCode,
  countMatchingTextBackgroundInCode,
  fixFilledControlContrast,
  fixMatchingTextBackground,
  hasLowContrastFilledControl,
  hasMatchingTextAndBackground,
} from './contrast-utils';
import { enforceUnifiedVisualMode } from './fix-ui-design';

describe('hasMatchingTextAndBackground', () => {
  it('detects identical arbitrary hex on bg and text', () => {
    expect(
      hasMatchingTextAndBackground(
        'rounded-full bg-[#111111] text-[#111111] px-7',
      ),
    ).toBe(true);
  });

  it('allows contrasting pair', () => {
    expect(
      hasMatchingTextAndBackground('rounded-full bg-[#111111] text-white px-7'),
    ).toBe(false);
  });
});

describe('hasLowContrastFilledControl', () => {
  it('detects dark grey text on dark grey button fill', () => {
    expect(
      hasLowContrastFilledControl(
        'rounded-full bg-[#141414] text-[#333333] font-semibold',
      ),
    ).toBe(true);
  });

  it('detects muted slate text on dark button', () => {
    expect(
      hasLowContrastFilledControl(
        'rounded-full bg-slate-800 text-slate-600 px-5',
      ),
    ).toBe(true);
  });
});

describe('fixFilledControlContrast', () => {
  it('fixes light-mode button with same dark bg and text', () => {
    const fixed = fixFilledControlContrast(
      'rounded-full bg-[#111111] text-[#111111] font-semibold',
      'light',
    );
    expect(fixed).toMatch(/bg-\[#111111\]/);
    expect(fixed).toMatch(/text-white/);
    expect(hasLowContrastFilledControl(fixed)).toBe(false);
  });

  it('fixes dark grey on dark grey CTA', () => {
    const fixed = fixFilledControlContrast(
      'rounded-full bg-[#1a1a1a] text-[#2a2a2a] px-5',
      'dark',
    );
    expect(fixed).toMatch(/text-white/);
    expect(hasLowContrastFilledControl(fixed)).toBe(false);
  });
});

describe('fixMatchingTextBackground', () => {
  it('delegates to fixFilledControlContrast', () => {
    const fixed = fixMatchingTextBackground(
      'rounded-full bg-[#111111] text-[#111111] font-semibold',
      'light',
    );
    expect(fixed).toMatch(/text-white/);
  });
});

describe('design pipeline preserves hero text-white on light shells', () => {
  it('keeps text-white on headings over dark hero backgrounds', () => {
    const code = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#f5f5f2] text-[#111111]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><SoftAurora /></div>
      <section className="relative z-[1] min-h-screen flex flex-col justify-center px-8">
        <h1 className="text-5xl font-bold text-white">Unlock the Future of Manufacturing</h1>
        <p className="mt-4 text-lg text-white/80">Join our academy</p>
      </section>
    </div>
  );
}`;
    const fixed = enforceUnifiedVisualMode(code, 'light');
    expect(fixed).toMatch(
      /<h1[^>]*text-white[^>]*>Unlock the Future of Manufacturing<\/h1>/,
    );
    expect(fixed).toMatch(/text-white\/80/);
  });
});

describe('design pipeline fixes same-color buttons', () => {
  it('auto-corrects bg-[#111111] text-[#111111] from light-mode remap bug', () => {
    const code = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#f5f5f2] text-[#111111]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><SoftAurora /></div>
      <button className="rounded-full px-7 py-3.5 min-h-[48px] text-[15px] font-semibold bg-[#111111] text-[#111111]">Get started</button>
    </div>
  );
}`;
    const fixed = enforceUnifiedVisualMode(code, 'light');
    expect(fixed).toMatch(
      /bg-\[#111111\][^>]*text-white|text-white[^>]*bg-\[#111111\]/,
    );
    expect(countMatchingTextBackgroundInCode(fixed)).toBe(0);
  });
});

describe('countLowContrastFilledControlsInCode', () => {
  it('counts bad buttons in generated code', () => {
    const code = `export default function GeneratedApp() {
      return (
        <button className="bg-[#111111] text-[#111111]">Go</button>
      );
    }`;
    expect(countLowContrastFilledControlsInCode(code)).toBe(1);
    expect(countMatchingTextBackgroundInCode(code)).toBe(1);
  });
});
