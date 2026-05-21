import {
  buildImageSearchQuery,
  buildLoremFlickrUrl,
  buildTopicImageUrl,
  pickTagsForImageSlot,
} from './topic-image-urls';

describe('buildImageSearchQuery', () => {
  it('combines theme and prompt keywords', () => {
    const query = buildImageSearchQuery(
      'Create a landing page for a personal finance app',
      'finance',
    );
    expect(query).toMatch(/finance/i);
    expect(query.length).toBeGreaterThan(3);
  });
});

describe('buildTopicImageUrl', () => {
  it('uses loremflickr with different locks per slot', () => {
    const prompt = 'wellness spa retreat';
    const a = buildTopicImageUrl({
      prompt,
      theme: 'wellness',
      index: 0,
      width: 1200,
      height: 800,
    });
    const b = buildTopicImageUrl({
      prompt,
      theme: 'wellness',
      index: 1,
      width: 600,
      height: 600,
    });
    expect(a).toMatch(/^https:\/\/loremflickr\.com\/1200\/800\//);
    expect(b).toMatch(/^https:\/\/loremflickr\.com\/600\/600\//);
    expect(a).not.toBe(b);
  });

  it('uses external url when provided', () => {
    const url = buildTopicImageUrl({
      prompt: 'test',
      theme: 'generic',
      index: 0,
      width: 100,
      height: 100,
      externalUrl: 'https://images.pexels.com/photos/123/pexels-photo.jpeg',
    });
    expect(url).toBe('https://images.pexels.com/photos/123/pexels-photo.jpeg');
  });
});

describe('pickTagsForImageSlot', () => {
  it('includes theme-relevant tags', () => {
    const tags = pickTagsForImageSlot('AI startup dashboard', 'ai', 0);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.some((t) => /robot|technology|computer|data|circuit/i.test(t))).toBe(
      true,
    );
  });
});

describe('buildLoremFlickrUrl', () => {
  it('encodes tags in the path', () => {
    expect(buildLoremFlickrUrl(400, 300, ['finance', 'office'], 42)).toBe(
      'https://loremflickr.com/400/300/finance,office?lock=42',
    );
  });
});
