import { prepareUiCode, validateUiCode } from './validate-ui-code';

describe('validateUiCode', () => {
  it('accepts a valid GeneratedApp component', () => {
    const code = `export default function GeneratedApp() {
  const [currentPage, setCurrentPage] = React.useState('home');
  return (
    <main className="p-8">
      <Button onClick={() => setCurrentPage('home')}>Home</Button>
      <h1>Hello</h1>
    </main>
  );
}`;

    expect(validateUiCode(code)).toEqual({ valid: true });
  });

  it('accepts legacy GeneratedPage component names', () => {
    const code = `export default function GeneratedPage() {
  return (
    <main className="p-8">
      <Card><CardContent><h1>Hello</h1></CardContent></Card>
    </main>
  );
}`;

    expect(validateUiCode(code)).toEqual({ valid: true });
  });

  it('rejects empty return values', () => {
    const code = `export default function GeneratedApp() {
  return <div />;
}`;

    expect(validateUiCode(code).valid).toBe(false);
  });

  it('rejects unsafe patterns', () => {
    const code = `export default function GeneratedApp() {
  return <div dangerouslySetInnerHTML={{ __html: 'x' }} />;
}`;

    expect(validateUiCode(code).valid).toBe(false);
  });

  it('rejects invalid syntax', () => {
    const result = validateUiCode('export default function GeneratedApp({');
    expect(result.valid).toBe(false);
    expect(typeof result.error).toBe('string');
  });

  it('rejects self-referencing GeneratedApp wrapper', () => {
    const code = `export default function GeneratedApp() {
  const [currentPage, setCurrentPage] = React.useState('main');
  return (
    <GeneratedApp>
      <main><h1>Hello</h1></main>
    </GeneratedApp>
  );
}`;

    expect(validateUiCode(code).valid).toBe(false);
  });

  it('rejects nested function components in JSX', () => {
    const code = `export default function GeneratedApp() {
  return (
    <main>
      {function App() {
        return <section><h1>Hi</h1></section>;
      }}
      {App()}
    </main>
  );
}`;

    const result = validateUiCode(code);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/nested components/i);
  });

  it('rejects nested component calls like {App()}', () => {
    const code = `export default function GeneratedApp() {
  return (
    <main>
      {App()}
    </main>
  );
}`;

    const result = validateUiCode(code);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/nested components/i);
  });
});

describe('prepareUiCode', () => {
  it('normalizes orphan JSX and validates successfully', () => {
    const input = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="reactbits-bg absolute inset-0 z-0"><Aurora /></div>
      <main className="relative z-10 px-4 py-12">
        <Card className="p-4 bg-white/5 border-white/10">
          <CardContent><h1 className="text-4xl font-bold">Pricing</h1></CardContent>
        </Card>
      </main>
    </div>
  );
}`;

    const { code, validation } = prepareUiCode(input);

    expect(validation).toEqual({ valid: true });
    expect(code).toContain('export default function GeneratedApp');
    expect(code).toContain('Pricing');
  });

  it('migrates GeneratedPage to GeneratedApp', () => {
    const input = `export default function GeneratedPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div className="reactbits-bg absolute inset-0 z-0"><SoftAurora /></div>
      <main className="relative z-10 px-4 py-12">
        <h1 className="text-4xl font-bold">Legacy</h1>
      </main>
    </div>
  );
}`;

    const { code, validation } = prepareUiCode(input);

    expect(validation.valid).toBe(true);
    expect(code).toContain('GeneratedApp');
    expect(code).not.toContain('GeneratedPage');
  });
});
