import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string(),
    text: z.string(),
  })
})

export const updatePostSchema = z.object({
  body: createPostSchema.shape.body.partial(),
});

export const postIdParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];