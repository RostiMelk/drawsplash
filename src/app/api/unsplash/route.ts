import { UnsplashFilterSchema, UnsplashResponseSchema } from "@/types/unsplash";
import { z } from "zod";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const searchParams = Object.fromEntries(requestUrl.searchParams);

    const filter = UnsplashFilterSchema.parse({
      query: searchParams.query || "random",
      orientation: searchParams.orientation,
      color: searchParams.color,
      orderBy: searchParams.order_by,
      page: Number.parseInt(searchParams.page ?? 1),
      perPage: Number.parseInt(searchParams.per_page ?? 10),
    });

    const url = new URL(UNSPLASH_API_URL);
    if (filter.query) url.searchParams.append("query", filter.query);
    if (filter.orientation)
      url.searchParams.append("orientation", filter.orientation);
    if (filter.color) url.searchParams.append("color", filter.color);
    if (filter.orderBy) url.searchParams.append("order_by", filter.orderBy);
    url.searchParams.append("page", String(filter.page));
    url.searchParams.append("per_page", String(filter.perPage));

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: error.message || "Failed to fetch images" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validatedData = UnsplashResponseSchema.parse(data);

    return Response.json(validatedData);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
