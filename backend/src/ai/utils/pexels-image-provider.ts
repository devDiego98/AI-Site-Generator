import { buildImageSearchQuery } from './topic-image-urls';
import type { PromptTheme } from './prompt-theme-types';

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

interface PexelsPhoto {
  src?: {
    large2x?: string;
    large?: string;
    medium?: string;
    portrait?: string;
  };
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[];
}

/**
 * Fetches topic-relevant image URLs from Pexels (free API key: https://www.pexels.com/api/).
 */
export async function fetchPexelsImageUrls(
  apiKey: string,
  prompt: string,
  theme: PromptTheme,
  count: number,
): Promise<string[]> {
  if (count <= 0) {
    return [];
  }

  const query = buildImageSearchQuery(prompt, theme);
  const perPage = Math.min(Math.max(count, 8), 15);
  const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as PexelsSearchResponse;
    const urls =
      data.photos
        ?.map(
          (p) =>
            p.src?.large2x ??
            p.src?.large ??
            p.src?.medium ??
            p.src?.portrait ??
            null,
        )
        .filter((u): u is string => Boolean(u)) ?? [];

    if (urls.length === 0) {
      return [];
    }

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(urls[i % urls.length]);
    }
    return result;
  } catch {
    return [];
  }
}
