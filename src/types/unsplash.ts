import { z } from "zod";

export const UnsplashImageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  alternative_slugs: z.any(),
  created_at: z.string(),
  updated_at: z.string(),
  promoted_at: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  color: z.string(),
  blur_hash: z.string(),
  description: z.string().nullable(),
  alt_description: z.string().nullable(),
  breadcrumbs: z.array(z.any()),
  urls: z.object({
    regular: z.string().url(),
    small: z.string().url(),
    thumb: z.string().url(),
  }),
  links: z.any(),
  likes: z.number(),
  liked_by_user: z.boolean(),
  current_user_collections: z.array(z.any()),
  sponsorship: z.any().nullable(),
  topic_submissions: z.record(z.any()),
  asset_type: z.string(),
  user: z.any(),
});

export const UnsplashFilterSchema = z.object({
  query: z.string().optional(),
  orientation: z.enum(["landscape", "portrait", "squarish"]).optional(),
  color: z.string().optional(),
  orderBy: z.enum(["relevant", "latest"]).optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
});

export const UnsplashResponseSchema = z.object({
  results: z.array(UnsplashImageSchema),
  total: z.number(),
  total_pages: z.number(),
});

export type UnsplashFilter = z.infer<typeof UnsplashFilterSchema>;
export type UnsplashImage = z.infer<typeof UnsplashImageSchema>;
export type UnsplashResponse = z.infer<typeof UnsplashResponseSchema>;
