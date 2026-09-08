import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { AppDataSource } from "../src/data-source.js";
import { UserEntity } from "../src/entities/user.entity.js";
import { PostEntity } from "../src/entities/post.entity.js";
import { getAuthHeader } from "./utils/auth.js";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Posts API Integration Tests", () => {
  let userId: number;
  let authHeader: string;
  let otherUserId: number;
  let otherAuthHeader: string;

  beforeAll(async () => {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = userRepository.create({
      name: "Post Owner",
      email: "post_owner@gmail.com",
      password: "not-a-real-hash",
      isVerified: false,
    });
    await userRepository.save(user);
    userId = user.id;
    authHeader = getAuthHeader(user);

    const otherUser = userRepository.create({
      name: "Other User",
      email: "other_user@gmail.com",
      password: "not-a-real-hash",
      isVerified: false,
    });
    await userRepository.save(otherUser);
    otherUserId = otherUser.id;
    otherAuthHeader = getAuthHeader(otherUser);
  });

  afterAll(async () => {
    const postRepository = AppDataSource.getRepository(PostEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    // posts must go first: the FK constraint has no ON DELETE cascade
    await postRepository.delete({ userId });
    await postRepository.delete({ userId: otherUserId });
    await userRepository.delete([userId, otherUserId]);
  });

  describe("POST /posts", () => {
    it("creates a post owned by the authenticated user", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "First post", text: "Hello world" });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("First post");
      expect(response.body.userId).toBe(userId);
    });

    it("ignores a client-supplied userId and uses the authenticated user instead", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Spoofed", text: "Hello", userId: otherUserId });

      expect(response.status).toBe(201);
      expect(response.body.userId).toBe(userId);
    });

    it("responds with 401 without an access token", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ title: "No auth", text: "Hello" });

      expect(response.status).toBe(401);
    });

    it("responds with 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Missing text" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /posts/my", () => {
    it("returns only the authenticated user's posts", async () => {
      await request(app)
        .post("/posts")
        .set("Authorization", otherAuthHeader)
        .send({ title: "Other user's post", text: "Body" });

      await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Main user's post", text: "Body" });

      const response = await request(app)
        .get("/posts/my")
        .set("Authorization", otherAuthHeader);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const titles = response.body.map((post: { title: string }) => post.title);
      expect(titles).toContain("Other user's post");
      expect(titles).not.toContain("Main user's post");

      for (const post of response.body) {
        expect(post.userId).toBe(otherUserId);
      }
    });
  });

  describe("GET /posts/:id", () => {
    let postId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Fetchable", text: "Body" });
      postId = response.body.id;
    });

    it("responds with 200 and the post", async () => {
      const response = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .get("/posts/999999999")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
    });

    it("responds with 400 for a malformed id", async () => {
      const response = await request(app)
        .get("/posts/abc")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /posts/:id", () => {
    let postId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Original title", text: "Original text" });
      postId = response.body.id;
    });

    it("responds with 403 when a different user tries to update it", async () => {
      const response = await request(app)
        .patch(`/posts/${postId}`)
        .set("Authorization", otherAuthHeader)
        .send({ title: "Hijacked title" });

      expect(response.status).toBe(403);

      const getResponse = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", authHeader);
      expect(getResponse.body.title).toBe("Original title");
    });

    it("updates only the provided fields and returns the full updated post", async () => {
      const response = await request(app)
        .patch(`/posts/${postId}`)
        .set("Authorization", authHeader)
        .send({ title: "Updated title" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated title");
      // untouched field must survive a partial update
      expect(response.body.text).toBe("Original text");
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .patch("/posts/999999999")
        .set("Authorization", authHeader)
        .send({ title: "Doesn't matter" });

      expect(response.status).toBe(404);
    });

    it("responds with 400 for a malformed id", async () => {
      const response = await request(app)
        .patch("/posts/abc")
        .set("Authorization", authHeader)
        .send({ title: "Doesn't matter" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /posts/:id", () => {
    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .delete("/posts/999999999")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
    });

    it("responds with 400 for a malformed id", async () => {
      const response = await request(app)
        .delete("/posts/abc")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
    });

    it("responds with 403 when a different user tries to delete it", async () => {
      const createResponse = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "Not yours", text: "Body" });
      const postId = createResponse.body.id;

      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set("Authorization", otherAuthHeader);

      expect(response.status).toBe(403);

      const getAfter = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", authHeader);
      expect(getAfter.status).toBe(200);
    });

    it("deletes the post and returns 204", async () => {
      const createResponse = await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: "To delete", text: "Body" });
      const postId = createResponse.body.id;

      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getAfterDelete = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", authHeader);
      expect(getAfterDelete.status).toBe(404);
    });
  });
});
