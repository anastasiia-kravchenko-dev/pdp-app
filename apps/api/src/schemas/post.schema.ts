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

export const getPostsQuerySchema = z.object({
  query: z.object({
    // z.coerce.number() - convert to number
    // .int() - make integer num
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
    sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
    title: z.string().optional(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>["query"];