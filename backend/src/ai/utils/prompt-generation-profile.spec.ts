import { createGenerationVariation } from './generation-variation';
import {
  augmentUserPromptForGeneration,
  buildGenerationProfile,
  inferVisualMode,
} from './prompt-generation-profile';

describe('inferVisualMode', () => {
  it('prefers light for wellness prompts', () => {
    expect(
      inferVisualMode('Create a calm wellness spa landing with soft pastel tones'),
    ).toBe('light');
  });

  it('prefers dark for gaming prompts', () => {
    expect(
      inferVisualMode('Create a dark neon gaming tournament landing page'),
    ).toBe('dark');
  });
});

describe('buildGenerationProfile', () => {
  it('uses pricing-focus for pricing-only prompts', () => {
    const profile = buildGenerationProfile(
      'Create a pricing section for a SaaS product with three plans',
    );
    expect(profile.archetype).toBe('pricing-focus');
    expect(profile.pageStrategy).toMatch(/single screen/i);
  });

  it('uses event archetype for meetup prompts', () => {
    const profile = buildGenerationProfile(
      'Create an event page for a technology meetup about artificial intelligence',
    );
    expect(profile.archetype).toBe('event-experience');
    expect(profile.sections).toEqual(
      expect.arrayContaining([expect.stringMatching(/agenda|speaker/i)]),
    );
  });

  it('varies layout brief for repeated meetup prompts', () => {
    const prompt =
      'Create an event page for a technology meetup about artificial intelligence';
    const profiles = Array.from({ length: 8 }, () =>
      buildGenerationProfile(prompt, createGenerationVariation()),
    );
    const pageStrategies = new Set(profiles.map((p) => p.pageStrategy));
    const heroes = new Set(profiles.map((p) => p.heroStyle));
    expect(pageStrategies.size).toBeGreaterThan(1);
    expect(heroes.size).toBeGreaterThan(1);
    expect(profiles.every((p) => p.variationNonce)).toBe(true);
  });

  it('differs between finance and course prompts', () => {
    const finance = buildGenerationProfile(
      'Create a modern landing page for a personal finance app',
    );
    const course = buildGenerationProfile(
      'Create a landing page for an AI course for entrepreneurs',
    );
    expect(finance.archetype).not.toBe(course.archetype);
  });
});

describe('augmentUserPromptForGeneration', () => {
  it('includes generation brief before user prompt', () => {
    const augmented = augmentUserPromptForGeneration(
      'Create a 3D printing academy site',
      createGenerationVariation(),
    );
    expect(augmented).toContain('GENERATION BRIEF');
    expect(augmented).toContain('Variation ID');
    expect(augmented).toContain('USER PROMPT');
    expect(augmented).toContain('3D printing academy');
  });
});
