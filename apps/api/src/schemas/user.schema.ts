import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email({}),
  })
})

export const updateUserSchema = z.object({
  body: createUserSchema.shape.body.partial()
})

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];