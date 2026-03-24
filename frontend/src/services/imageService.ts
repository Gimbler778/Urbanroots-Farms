import { getProductImages } from '@/services/api';

const imageCache = new Map<string, string[]>();

const fallbackIcons = [
  'https://cdn-icons-png.flaticon.com/512/747/747376.png',
  'https://cdn-icons-png.flaticon.com/512/2292/2292039.png',
];

function getFallbackImages(searchQuery: string, count: number): string[] {
  const seed = searchQuery
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % fallbackIcons.length;

  return Array.from({ length: count }, (_, i) => fallbackIcons[(seed + i) % fallbackIcons.length]);
}

export async function fetchProductImages(searchQuery: string, count = 2): Promise<string[]> {
  const cacheKey = `pexels_v1_${searchQuery}_${count}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const response = await getProductImages(searchQuery, count);
    const images = response.images?.slice(0, count) ?? [];

    if (!images.length) {
      return getFallbackImages(searchQuery, count);
    }

    // Cache only successful provider responses, not fallback placeholders.
    if (response.source !== 'fallback') {
      imageCache.set(cacheKey, images);
    }
    return images;
  } catch {
    return getFallbackImages(searchQuery, count);
  }
}

export function clearImageCache(): void {
  imageCache.clear();
}
