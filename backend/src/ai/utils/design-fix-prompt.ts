/** User message sent to the AI when UI code fails validation or design checks. */
export function buildDesignFixUserMessage(issues: string): string {
  return `That code is invalid or fails design quality checks:

${issues}

Return corrected UI code only — no markdown, no fences, no explanations.
Use a single export default function GeneratedApp with all markup in its return — no <GeneratedApp> wrapper, no nested function components, no {App()} calls.

Design requirements (ReactBits cinematic minimal):
- Canvas: fixed inset-0 z-0 pointer-events-none in reactbits-bg wrapper.
- Floating pill navbar: fixed top-5 left-1/2 -translate-x-1/2, max-w-[1120px], justify-between — logo left, links in flex-1 justify-center, Sign up/Login/avatar CTA on the right (never CTA beside logo only).
- Hero: min-h-[100svh], headline/subline/CTAs bare on background — NEVER inside Card.
- Content <section>: transparent, padding only — no backdrop-blur or card styling on sections.
- Leaf Cards only: backdrop-blur-[14px] rounded-[14px] shadow-none; bg-white/70 (light) or bg-white/5 (dark). Multiple sibling Cards in a grid are OK — never nest a Card inside another Card.
- ReactBits: pick from dark OR light theme component list only.
- Root: bg-[#0d0d0d] dark or bg-[#f5f5f2] light.
- Buttons/CTAs: background and text must CONTRAST — never dark text on dark fills; dark page primary CTA: bg-white text-[#111111]; dark fill buttons: text-white only.
- Fix every issue listed above in one pass.`;
}
