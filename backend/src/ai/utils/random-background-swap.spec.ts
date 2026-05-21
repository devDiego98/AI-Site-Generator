import {
  applyRandomBackgroundSwap,
  detectCurrentBackground,
  isRandomBackgroundChangeRequest,
} from './random-background-swap';

const SAMPLE = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="reactbits-bg absolute inset-0 z-0">
        <SoftAurora color1={'#f7f7f7'} color2={'#e100ff'} />
      </div>
      <main className="relative z-10 p-8">
        <h1>Hello</h1>
      </main>
    </div>
  );
}`;

describe('isRandomBackgroundChangeRequest', () => {
  it('detects generic background change requests', () => {
    expect(isRandomBackgroundChangeRequest('change the background')).toBe(
      true,
    );
    expect(isRandomBackgroundChangeRequest('swap background please')).toBe(
      true,
    );
    expect(isRandomBackgroundChangeRequest('try a different background')).toBe(
      true,
    );
  });

  it('returns false when a specific component is named', () => {
    expect(
      isRandomBackgroundChangeRequest('change background to Hyperspeed'),
    ).toBe(false);
  });

  it('returns false for unrelated edits', () => {
    expect(isRandomBackgroundChangeRequest('make the header bigger')).toBe(
      false,
    );
  });

  it('returns false when user only wants color changes', () => {
    expect(isRandomBackgroundChangeRequest('change background colors')).toBe(
      false,
    );
    expect(
      isRandomBackgroundChangeRequest('make the background more blue'),
    ).toBe(false);
    expect(
      isRandomBackgroundChangeRequest('update background color to #00ff88'),
    ).toBe(false);
    expect(
      isRandomBackgroundChangeRequest('change the background gradient to cyan'),
    ).toBe(false);
  });
});

describe('applyRandomBackgroundSwap', () => {
  it('replaces the current background inside reactbits-bg', () => {
    const { code, component } = applyRandomBackgroundSwap(SAMPLE, {
      exclude: 'SoftAurora',
    });
    expect(component).not.toBe('SoftAurora');
    expect(code).not.toContain('<SoftAurora');
    expect(code).toContain(`<${component}`);
    expect(detectCurrentBackground(code)).toBe(component);
  });
});
