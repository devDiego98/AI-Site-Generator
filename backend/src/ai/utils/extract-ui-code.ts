const FENCE_PATTERN =
  /^```(?:tsx?|jsx?|javascript|html)?\s*\n?([\s\S]*?)```\s*$/i;

export function extractUiCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }

  const fenceMatch = FENCE_PATTERN.exec(trimmed);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:tsx?|jsx?|javascript|html)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
  }

  return trimmed;
}
