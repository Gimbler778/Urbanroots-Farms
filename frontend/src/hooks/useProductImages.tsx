import { useEffect, useState } from 'react';
import { fetchProductImages } from '../services/imageService';

interface UseProductImagesResult {
  images: string[];
  loading: boolean;
  error: string | null;
}

function normalizeProductName(value: string): string {
  return value
    .replace(/\s+\d+$/, '')
    .replace(/\s+Service$/i, '')
    .trim();
}

/**
 * Hook to fetch product images via backend (Pexels provider)
 */
export function useProductImages(
  productName: string,
  category: 'equipment' | 'service',
  initialImages: string[]
): UseProductImagesResult {
  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedName = normalizeProductName(productName);

        // Build search query based on product name and category
        const searchQuery = category === 'equipment'
          ? `${normalizedName} agriculture equipment`
          : `${normalizedName} agriculture service farming`;

        const fetchedImages = await fetchProductImages(searchQuery, 2);

        if (isMounted && fetchedImages.length > 0) {
          setImages(fetchedImages);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load images');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [productName, category]);

  return { images, loading, error };
}
