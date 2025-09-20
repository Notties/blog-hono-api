import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export const updatePostSchema = z
  .object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
  })
  .refine((data) => data.title || data.content, {
    message: "Either title or content must be provided for an update",
  });
