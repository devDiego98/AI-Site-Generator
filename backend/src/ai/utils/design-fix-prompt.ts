/** User message sent to the AI when UI code fails validation or design checks. */
export function buildDesignFixUserMessage(issues: string): string {
  return `That code is invalid or fails design quality checks:

${issues}

Return corrected UI code only — no markdown, no fences, no explanations.
Use a single export default function GeneratedApp with all markup in its return — no <GeneratedApp> wrapper, no nested function components, no {App()} calls.
Every JSX tag MUST have a space before attributes (<nav className="..."> never <navclassName="...">).

Design requirements (ReactBits site generator):
- Canvas: fixed inset-0 z-0 pointer-events-none in reactbits-bg wrapper; content relative z-[1].
- Navbar: full-width sticky for most archetypes; floating pill ONLY for archetype 4 (Minimal Cinematic).
- Hero: match archetype; headline/subline/CTAs bare on background — NEVER inside Card.
- Sections below hero: useInView + Framer Motion scroll animations (fade-up or stagger).
- Content <section>: transparent, padding only — no backdrop-blur or card styling on sections.
- Images: topic-matched Unsplash with ?w=&q=80, explicit height class, real layout patterns — never stacked full-width images.
- Leaf Cards only: backdrop-blur-[14px] shadow-none; bg-card/60. Multiple sibling Cards in a grid are OK — never nest a Card inside another Card.
- ReactBits: pick from dark OR light theme component list only (installed globals).
- useRef / useInView: if you use ref={ref}, you MUST define const ref = useRef(null) and const isInView = useInView(ref, { once: true }) in GeneratedApp — never use ref={ref} without defining ref.
- Root: bg-[#0d0d0d] dark or bg-[#f5f5f2] light.
- Buttons/CTAs: background and text must CONTRAST — never dark text on dark fills.
- Fix every issue listed above in one pass.`;
}
