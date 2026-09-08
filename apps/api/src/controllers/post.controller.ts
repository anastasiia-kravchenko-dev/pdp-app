import { Request, Response, NextFunction } from "express";
import { postService } from "../services/post.service.js";

export const getAllPostsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await postService.getAllPosts();

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
    const post = await postService.getUserPosts(req.userId!);

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
