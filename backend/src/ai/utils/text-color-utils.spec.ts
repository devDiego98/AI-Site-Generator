import { hasIntentionalTextColor } from './text-color-utils';
import { enforceUnifiedVisualMode } from './fix-ui-design';

describe('hasIntentionalTextColor', () => {
  it('detects Tailwind accent text colors', () => {
    expect(hasIntentionalTextColor('className="text-4xl font-bold text-green-500"')).toBe(
      true,
    );
    expect(hasIntentionalTextColor('text-emerald-600')).toBe(true);
  });

  it('ignores shell default text colors', () => {
    expect(hasIntentionalTextColor('text-[#efefef]')).toBe(false);
    expect(hasIntentionalTextColor('text-white')).toBe(false);
  });
});

describe('enforceUnifiedVisualMode preserves accent colors', () => {
  const codeWithGreenHeading = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-[#f0f0f0]">
      <div className="reactbits-bg fixed inset-0 z-0 pointer-events-none"><Galaxy /></div>
      <main className="relative z-[1] px-4 py-12">
        <h1 className="text-4xl font-bold text-green-500">AI Technology Meetup</h1>
      </main>
    </div>
  );
}`;

  it('does not append shell default color over text-green-500 on headings', () => {
    const fixed = enforceUnifiedVisualMode(codeWithGreenHeading, 'dark');
    expect(fixed).toContain('text-green-500');
    expect(fixed).not.toMatch(/text-green-500[^"]*text-\[#efefef\]/);
    expect(fixed).not.toMatch(/text-\[#efefef\][^"]*text-green-500/);
  });
});
