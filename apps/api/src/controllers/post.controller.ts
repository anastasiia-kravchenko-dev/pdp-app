import { Request, Response, NextFunction } from "express";
import { postService } from "../services/post.service.js";
import { GetPostsQuery } from "../schemas/post.schema.js";

export const getAllPostsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await postService.getAllPosts(
      req.query as unknown as GetPostsQuery,
    );

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getUserPostsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await postService.getUserPosts(
      req.userId!,
      req.query as unknown as GetPostsQuery,
    );

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const getPostByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(Number(id));

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await postService.createPost(req.userId!, req.body);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const updatePostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const post = await postService.updatePost(Number(id), req.userId!, req.body);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const deletePostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await postService.deletePost(Number(id), req.userId!);

    if (result.affected === 0) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
