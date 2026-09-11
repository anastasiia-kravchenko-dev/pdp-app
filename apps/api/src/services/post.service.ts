import type { DeleteResult } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { PostEntity } from "../entities/post.entity.js";
import {
  CreatePostInput,
  GetPostsQuery,
  UpdatePostInput,
} from "../schemas/post.schema.js";
import { HttpError } from "../middlewares/error.middleware.js";

export class PostService {
  private postRepository = AppDataSource.getRepository(PostEntity);

  async getAllPosts(query: GetPostsQuery) {
    const { page, limit, sortBy, sortOrder, title } = query;

    const queryBuilder = this.postRepository.createQueryBuilder("post");

    if (title) {
      // = exact match
      // ILIKE case-insensitive substring search:
      queryBuilder.where("post.title ILIKE :title", { title: `%${title}%` });
    }

    queryBuilder
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    // [posts_array, total_count]
    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      data: posts,
      meta: {
        page,
        limit,
        count: total,
      },
    };
  }

  async getUserPosts(userId: number, query: GetPostsQuery) {
    const { page, limit, sortBy, sortOrder, title } = query;

    const queryBuilder = this.postRepository
      .createQueryBuilder("post")
      .where("post.userId = :userId", { userId });

    if (title) {
      queryBuilder.andWhere("post.title ILIKE :title", { title: `%${title}%` });
    }

    queryBuilder
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      data: posts,
      meta: {
        page,
        limit,
        count: total,
      },
    };
  }

  async getPostById(postId: number) {
    return await this.postRepository.findOne({
      where: { id: postId },
    });
  }

  async createPost(userId: number, post: CreatePostInput) {
    const newPost = this.postRepository.create({ ...post, userId });
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
