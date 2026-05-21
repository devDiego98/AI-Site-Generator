import { extractUiCode } from './extract-ui-code';

describe('extractUiCode', () => {
  it('returns trimmed plain code', () => {
    const input = '  export default function GeneratedPage() {}  ';
    expect(extractUiCode(input)).toBe(
      'export default function GeneratedPage() {}',
    );
  });

  it('strips tsx markdown fences', () => {
    const input = '```tsx\nexport default function GeneratedPage() {}\n```';
    expect(extractUiCode(input)).toBe(
      'export default function GeneratedPage() {}',
    );
  });

  it('returns empty string for empty input', () => {
    expect(extractUiCode('   ')).toBe('');
  });
});
