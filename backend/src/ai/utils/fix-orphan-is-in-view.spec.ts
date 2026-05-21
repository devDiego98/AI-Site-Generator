import {
  fixOrphanIsInView,
  hasOrphanIsInView,
} from './fix-orphan-is-in-view';

describe('fix-orphan-is-in-view', () => {
  it('detects isInView without useInView definition', () => {
    const code = `animate={isInView ? { opacity: 1 } : {}}`;
    expect(hasOrphanIsInView(code)).toBe(true);
  });

  it('keeps code when isInView is defined', () => {
    const code = `const isInView = useInView(ref, { once: true })
animate={isInView ? { opacity: 1 } : {}}`;
    expect(hasOrphanIsInView(code)).toBe(false);
    expect(fixOrphanIsInView(code)).toBe(code);
  });

  it('injects hooks and ref on animated section', () => {
    const code = `export default function GeneratedApp() {
  return (
    <section className="hero">Hero</section>
    <section className="content">
      <motion.div animate={isInView ? { opacity: 1, x: 0 } : {}} />
    </section>
  );
}`;
    const fixed = fixOrphanIsInView(code);
    expect(fixed).toContain('const ref = useRef(null)');
    expect(fixed).toContain('const isInView = useInView(ref');
    expect(fixed).toContain('<section ref={ref} className="content">');
    expect(fixed).not.toContain('<section ref={ref} className="hero">');
  });
});
