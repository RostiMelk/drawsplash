import type { UnsplashFilter, UnsplashResponse } from '@/types/unsplash';

const DEFAULT_PER_PAGE = 20;

export async function fetchUnsplashImages(
  filter: UnsplashFilter,
  page: number,
  signal?: AbortSignal,
): Promise<{ images: UnsplashResponse; nextPage: number }> {
  const url = new URL('/api/unsplash', window.location.origin);

  const filterParams = {
    page,
    per_page: filter.perPage || DEFAULT_PER_PAGE,
    query: filter.query,
    orientation: filter.orientation,
    color: filter.color,
    order_by: filter.orderBy,
  };

  for (const [key, value] of Object.entries(filterParams)) {
    if (value) url.searchParams.append(key, value.toString());
  }

  const response = await fetch(url, { signal });
  const data = (await response.json()) as UnsplashResponse;

  return { images: data, nextPage: page + 1 };
}
