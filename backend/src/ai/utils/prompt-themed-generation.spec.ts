import { applyTopicImagesToCode } from './apply-topic-images';
import { createGenerationVariation } from './generation-variation';
import {
  applyPromptThemedBackground,
  applyPromptThemedGeneration,
  pickBackgroundForPrompt,
} from './prompt-themed-generation';
import { inferPrimaryTheme } from './prompt-theme-inference';
import { detectCurrentBackground } from './random-background-swap';

const SAMPLE = `export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="reactbits-bg absolute inset-0 z-0">
        <SoftAurora color1={'#f7f7f7'} color2={'#e100ff'} />
      </div>
      <main className="relative z-10 p-8">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" alt="Hero" />
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" alt="Card" />
      </main>
    </div>
  );
}`;

describe('inferPrimaryTheme', () => {
  it('detects education from course prompts', () => {
    expect(
      inferPrimaryTheme('Create a landing page for an AI course for entrepreneurs'),
    ).toBe('education');
  });

  it('detects finance from personal finance prompts', () => {
    expect(
      inferPrimaryTheme('Create a modern landing page for a personal finance app'),
    ).toBe('finance');
  });
});

describe('pickBackgroundForPrompt', () => {
  it('returns stable background for the same prompt without variation', () => {
    const prompt = 'Create a landing page for a 3D printing academy';
    expect(pickBackgroundForPrompt(prompt)).toBe(pickBackgroundForPrompt(prompt));
  });

  it('can differ for the same prompt across generation runs', () => {
    const prompt =
      'Create an event page for a technology meetup about artificial intelligence';
    const picks = new Set(
      Array.from({ length: 12 }, () =>
        pickBackgroundForPrompt(prompt, createGenerationVariation()),
      ),
    );
    expect(picks.size).toBeGreaterThan(1);
  });

  it('often differs across different prompts', () => {
    const a = pickBackgroundForPrompt('fiber optic telecom landing');
    const b = pickBackgroundForPrompt('wellness spa meditation retreat');
    expect(a).not.toBe(b);
  });
});

describe('applyPromptThemedBackground', () => {
  it('replaces the AI background with a prompt-themed component', () => {
    const prompt = 'fiber optic telecom ISP landing page';
    const { code, component } = applyPromptThemedBackground(prompt, SAMPLE);
    expect(['Hyperspeed', 'LaserFlow', 'GridScan']).toContain(component);
    expect(code).not.toContain('<SoftAurora');
    expect(detectCurrentBackground(code)).toBe(component);
  });
});

describe('applyTopicImagesToCode', () => {
  it('replaces image srcs with unique topic-based loremflickr urls', async () => {
    const result = await applyTopicImagesToCode(
      'Create an event page for a technology meetup',
      SAMPLE,
      'events',
    );
    const urls = [
      ...result.matchAll(/src=(?:"([^"]+)"|'([^']+)'|\{\s*"([^"]+)"\s*\})/g),
    ].map((m) => m[1] ?? m[2] ?? m[3]);

    expect(urls.length).toBe(2);
    expect(urls[0]).toMatch(/^https:\/\/loremflickr\.com\//);
    expect(urls[1]).toMatch(/^https:\/\/loremflickr\.com\//);
    expect(urls[0]).not.toBe(urls[1]);
    expect(result).not.toContain('unsplash.com');
  });
});

describe('applyPromptThemedGeneration', () => {
  it('keeps AI-chosen background and applies topic images', async () => {
    const prompt = 'Create a pricing section for a SaaS product';
    const { code, background } = await applyPromptThemedGeneration(prompt, SAMPLE);
    expect(background).toBe('SoftAurora');
    expect(code).toContain('<SoftAurora');
    expect(code).toMatch(/loremflickr\.com/);
    expect(code).not.toContain('unsplash.com');
  });

  it('injects background only when missing', async () => {
    const withoutBg = SAMPLE.replace(/<SoftAurora[^/]*\/>/, '');
    const { code, background } = await applyPromptThemedGeneration(
      'fiber optic telecom landing',
      withoutBg,
    );
    expect(background).not.toBeNull();
    expect(detectCurrentBackground(code)).toBe(background);
  });
});
