import { fetchPexelsImageUrls } from './pexels-image-provider';
import type { PromptTheme } from './prompt-theme-types';
import {
  buildTopicImageUrl,
  getImageSrcFromMatch,
  IMG_SRC_RE,
  isReplaceableImageSrc,
  parseImageDimensions,
} from './topic-image-urls';

export interface ApplyTopicImagesOptions {
  pexelsApiKey?: string | null;
  variationNonce?: string;
}

function collectImageSlots(code: string): Array<{
  fullMatch: string;
  url: string;
  isAvatar: boolean;
}> {
  const slots: Array<{ fullMatch: string; url: string; isAvatar: boolean }> = [];
  const re = new RegExp(IMG_SRC_RE.source, IMG_SRC_RE.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(code)) !== null) {
    const url = getImageSrcFromMatch(match);
    if (!isReplaceableImageSrc(url)) {
      continue;
    }
    const snippet = code.slice(
      Math.max(0, match.index - 80),
      match.index + match[0].length + 80,
    );
    const isAvatar = /AvatarImage|avatar/i.test(snippet);
    slots.push({ fullMatch: match[0], url, isAvatar });
  }

  return slots;
}

/**
 * Replaces every <img> / AvatarImage src with topic-relevant photos from Pexels (if keyed) or Lorem Flickr.
 */
export async function applyTopicImagesToCode(
  prompt: string,
  code: string,
  theme: PromptTheme,
  options: ApplyTopicImagesOptions = {},
): Promise<string> {
  const slots = collectImageSlots(code);
  if (slots.length === 0) {
    return code;
  }

  const dimensions = slots.map((slot) =>
    parseImageDimensions(slot.url, { isAvatar: slot.isAvatar }),
  );

  let externalUrls: string[] = [];
  if (options.pexelsApiKey?.trim()) {
    externalUrls = await fetchPexelsImageUrls(
      options.pexelsApiKey.trim(),
      prompt,
      theme,
      slots.length,
    );
  }

  const replacementUrls = slots.map((_, index) =>
    buildTopicImageUrl({
      prompt,
      theme,
      index,
      width: dimensions[index].width,
      height: dimensions[index].height,
      externalUrl: externalUrls[index] ?? null,
      variationNonce: options.variationNonce,
    }),
  );

  let slotIndex = 0;
  const re = new RegExp(IMG_SRC_RE.source, IMG_SRC_RE.flags);

  return code.replace(re, (fullMatch, ...groups) => {
    const url =
      groups[0] ?? groups[1] ?? groups[2] ?? groups[3] ?? '';
    if (!isReplaceableImageSrc(url)) {
      return fullMatch;
    }

    const nextUrl = replacementUrls[slotIndex];
    slotIndex += 1;
    return fullMatch.replace(url, nextUrl);
  });
}
