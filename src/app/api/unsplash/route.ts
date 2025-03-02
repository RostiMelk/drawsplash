import { UnsplashFilterSchema, UnsplashResponseSchema } from '@/types/unsplash';
import { z } from 'zod';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const searchParams = Object.fromEntries(requestUrl.searchParams);

    const url = new URL(UNSPLASH_API_URL);
    const filter = UnsplashFilterSchema.parse(searchParams);
    for (const [key, value] of Object.entries(filter)) {
      if (value) url.searchParams.append(key, value.toString());
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: error.message || 'Failed to fetch images' },
        { status: response.status },
      );
    }

    const data = await response.json();
    const validatedData = UnsplashResponseSchema.parse(data);

    return Response.json(validatedData);
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);

    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
