import type { UnsplashFilter, UnsplashResponse } from '@/types/unsplash';

export async function fetchUnsplashImages(
  filter: UnsplashFilter,
  page: number,
  signal?: AbortSignal,
): Promise<{ images: UnsplashResponse; nextPage: number }> {
  const url = new URL('/api/unsplash', window.location.origin);
  // Add page param to URL
  url.searchParams.append('page', page.toString());
  // Add filters to URL
  for (const [key, value] of Object.entries(filter)) {
    if (value) url.searchParams.append(key, value.toString());
  }

  const response = await fetch(url, { signal });
  const data = (await response.json()) as UnsplashResponse;

  return { images: data, nextPage: page + 1 };
}
