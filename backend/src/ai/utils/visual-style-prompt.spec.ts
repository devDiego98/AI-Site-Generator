import { augmentPromptWithVisualStyle } from './visual-style-prompt';

describe('augmentPromptWithVisualStyle', () => {
  it('returns prompt unchanged for auto', () => {
    expect(augmentPromptWithVisualStyle('Build a page', 'auto')).toBe(
      'Build a page',
    );
  });

  it('appends style hint for minimal', () => {
    expect(augmentPromptWithVisualStyle('Build a page', 'minimal')).toContain(
      'minimal',
    );
  });
});
