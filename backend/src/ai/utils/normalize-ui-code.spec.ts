import {
  isTrivialJsx,
  migrateToGeneratedApp,
  normalizeUiCode,
} from './normalize-ui-code';

describe('isTrivialJsx', () => {
  it('detects empty elements', () => {
    expect(isTrivialJsx('<div />')).toBe(true);
    expect(isTrivialJsx('<motion.div></motion.div>')).toBe(true);
    expect(isTrivialJsx('<div></div>')).toBe(true);
    expect(isTrivialJsx('')).toBe(true);
  });

  it('detects non-trivial markup', () => {
    expect(isTrivialJsx('<div><h1>Hello</h1></div>')).toBe(false);
  });
});

describe('migrateToGeneratedApp', () => {
  it('renames GeneratedPage to GeneratedApp', () => {
    const input = 'export default function GeneratedPage() {}';
    expect(migrateToGeneratedApp(input)).toBe(
      'export default function GeneratedApp() {}',
    );
  });
});

describe('normalizeUiCode', () => {
  it('moves orphan JSX into GeneratedApp when return is empty', () => {
    const input = `<div className="p-4">
  <h1>Pricing</h1>
</div>

function GeneratedApp() {
  return (
    <div />
  );
}

export default GeneratedApp;`;

    const result = normalizeUiCode(input);

    expect(result).toContain('export default function GeneratedApp');
    expect(result).toContain('<h1>Pricing</h1>');
    expect(result).not.toContain('export default GeneratedApp');
  });

  it('wraps bare JSX in GeneratedApp with routing state', () => {
    const input = '<section><h1>Hello</h1></section>';
    const result = normalizeUiCode(input);

    expect(result).toContain('export default function GeneratedApp');
    expect(result).toContain('React.useState');
    expect(result).toContain('<section><h1>Hello</h1></section>');
  });

  it('does not double-wrap a valid default export', () => {
    const input = `export default function GeneratedApp() {
  const [currentPage, setCurrentPage] = React.useState('home');
  return (
    <main className="p-8">
      <h1>Hello</h1>
    </main>
  );
}`;

    expect(normalizeUiCode(input)).toBe(input);
  });

  it('strips orphan ref={ref} without useRef', () => {
    const input = `export default function GeneratedApp() {
  return (
    <section id="schedule" ref={ref} className="py-8">Agenda</section>
  );
}`;
    const result = normalizeUiCode(input);
    expect(result).not.toContain('ref={ref}');
    expect(result).toContain('id="schedule"');
  });
});
