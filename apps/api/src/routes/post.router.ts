import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createPostController,
  deletePostController,
  getAllPostsController,
  getPostByIdController,
  getUserPostsController,
  updatePostController,
} from "../controllers/post.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPostSchema,
  getPostsQuerySchema,
  postIdParamsSchema,
  updatePostSchema,
} from "../schemas/post.schema.js";

export const postRouter = Router();

postRouter.use(requireAuth);

postRouter.get("/", validate(getPostsQuerySchema), getAllPostsController);
postRouter.get("/my", validate(getPostsQuerySchema), getUserPostsController);
postRouter.get("/:id", validate(postIdParamsSchema), getPostByIdController);
postRouter.post("/", validate(createPostSchema), createPostController);
postRouter.patch(
  "/:id",
  validate(postIdParamsSchema),
  validate(updatePostSchema),
  updatePostController,
);
postRouter.delete("/:id", validate(postIdParamsSchema), deletePostController);