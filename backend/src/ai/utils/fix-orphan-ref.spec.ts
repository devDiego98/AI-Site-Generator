import {
  hasOrphanRefAttribute,
  stripOrphanRefAttributes,
} from './fix-orphan-ref';

describe('fix-orphan-ref', () => {
  it('detects ref={ref} without useRef definition', () => {
    const code = `<section ref={ref} className="py-8">x</section>`;
    expect(hasOrphanRefAttribute(code)).toBe(true);
    expect(stripOrphanRefAttributes(code)).toBe(
      '<section className="py-8">x</section>',
    );
  });

  it('keeps ref={ref} when ref is defined', () => {
    const code = `export default function GeneratedApp() {
  const ref = useRef(null);
  return <section ref={ref}>x</section>;
}`;
    expect(hasOrphanRefAttribute(code)).toBe(false);
    expect(stripOrphanRefAttributes(code)).toBe(code);
  });
});
