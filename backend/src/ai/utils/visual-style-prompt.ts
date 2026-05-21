import type { VisualStyle } from '../../common/types/generated-ui';

const STYLE_HINTS: Record<Exclude<VisualStyle, 'auto'>, string> = {
  minimal:
    'Visual style: minimal — generous whitespace, restrained palette, few sections, typography-first.',
  bold: 'Visual style: bold — strong contrast, large type, vivid accents, dramatic hero.',
  corporate:
    'Visual style: corporate — trustworthy blues/grays, structured grid, clear hierarchy, professional tone.',
  playful:
    'Visual style: playful — rounded shapes, friendly copy, colorful accents, energetic layout.',
};

export function augmentPromptWithVisualStyle(
  prompt: string,
  visualStyle: VisualStyle | undefined,
): string {
  if (!visualStyle || visualStyle === 'auto') {
    return prompt;
  }

  return `${prompt.trim()}\n\n${STYLE_HINTS[visualStyle]}`;
}
