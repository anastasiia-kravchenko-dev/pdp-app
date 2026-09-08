import type { DeleteResult } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { PostEntity } from "../entities/post.entity.js";
import { CreatePostInput, UpdatePostInput } from "../schemas/post.schema.js";
import { HttpError } from "../middlewares/error.middleware.js";

export class PostService {
  private postRepository = AppDataSource.getRepository(PostEntity);

  async getAllPosts() {
    return await this.postRepository.find();
  }

  async getUserPosts(userId: number) {
    return await this.postRepository.find({
      where: { userId },
    });
  }

  async getPostById(postId: number) {
    return await this.postRepository.findOne({
      where: { id: postId },
    });
  }

  async createPost(userId: number, post: CreatePostInput) {
    const newPost = this.postRepository.create({...post, userId});
    return await this.postRepository.save(newPost);
  }

  async updatePost(postId: number, userId: number, post: UpdatePostInput) {
    const existingPost = await this.postRepository.findOneBy({ id: postId });

    if (!existingPost) {
      return null;
    }

    if (existingPost.userId !== userId) {
      throw new HttpError(403, "You can only update your own posts");
    }

    const updatedPost = await this.postRepository.preload({
      id: postId,
      ...post,
    });

    return await this.postRepository.save(updatedPost!);
  }

  async deletePost(postId: number, userId: number): Promise<DeleteResult> {
    const existingPost = await this.postRepository.findOneBy({ id: postId });

    if (!existingPost) {
      return { affected: 0, raw: [] };
    }

    if (existingPost.userId !== userId) {
      throw new HttpError(403, "You can only delete your own posts");
    }

    return await this.postRepository.delete(postId);
  }
}

export const postService = new PostService();