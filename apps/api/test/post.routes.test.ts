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

  describe("GET /posts", () => {
    const uniquePrefix = `PagTest_${Date.now()}`;
    const seedTitles = [
      `${uniquePrefix} Apple`,
      `${uniquePrefix} Banana`,
      `${uniquePrefix} Cherry`,
      `${uniquePrefix} Date`,
      `${uniquePrefix} Elderberry`,
    ];

    beforeAll(async () => {
      for (const title of seedTitles) {
        await request(app)
          .post("/posts")
          .set("Authorization", authHeader)
          .send({ title, text: "seed" });
      }
    });

    it("filters by title and reports the matching count in meta", async () => {
      const response = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({ title: uniquePrefix, limit: 100 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(seedTitles.length);
      expect(response.body.meta.count).toBe(seedTitles.length);
    });

    it("paginates results with no overlap between pages", async () => {
      const page1 = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({
          title: uniquePrefix,
          page: 1,
          limit: 2,
          sortBy: "title",
          sortOrder: "ASC",
        });

      const page2 = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({
          title: uniquePrefix,
          page: 2,
          limit: 2,
          sortBy: "title",
          sortOrder: "ASC",
        });

      expect(page1.body.data).toHaveLength(2);
      expect(page2.body.data).toHaveLength(2);
      expect(page1.body.meta).toEqual({ page: 1, limit: 2, count: seedTitles.length });
      expect(page2.body.meta).toEqual({ page: 2, limit: 2, count: seedTitles.length });

      const page1Titles = page1.body.data.map((post: { title: string }) => post.title);
      const page2Titles = page2.body.data.map((post: { title: string }) => post.title);
      expect(page1Titles).toEqual([`${uniquePrefix} Apple`, `${uniquePrefix} Banana`]);
      expect(page2Titles).toEqual([`${uniquePrefix} Cherry`, `${uniquePrefix} Date`]);
    });

    it("sorts by title descending", async () => {
      const response = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({ title: uniquePrefix, limit: 100, sortBy: "title", sortOrder: "DESC" });

      const titles = response.body.data.map((post: { title: string }) => post.title);
      expect(titles).toEqual([...titles].sort().reverse());
    });

    it("returns an empty data array for an out-of-range page", async () => {
      const response = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({ title: uniquePrefix, page: 999, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.count).toBe(seedTitles.length);
    });

    it("responds with 400 for a sortBy value outside the whitelist", async () => {
      const response = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({ sortBy: "dropTable" });

      expect(response.status).toBe(400);
    });

    it("responds with 400 for a limit above the max", async () => {
      const response = await request(app)
        .get("/posts")
        .set("Authorization", authHeader)
        .query({ limit: 1000 });

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
      expect(Array.isArray(response.body.data)).toBe(true);

      const titles = response.body.data.map((post: { title: string }) => post.title);
      expect(titles).toContain("Other user's post");
      expect(titles).not.toContain("Main user's post");

      for (const post of response.body.data) {
        expect(post.userId).toBe(otherUserId);
      }
    });

    it("stays scoped to the authenticated user when filtering by title", async () => {
      const sharedTitle = `Shared_${Date.now()}`;

      await request(app)
        .post("/posts")
        .set("Authorization", authHeader)
        .send({ title: sharedTitle, text: "mine" });

      await request(app)
        .post("/posts")
        .set("Authorization", otherAuthHeader)
        .send({ title: sharedTitle, text: "theirs" });

      const response = await request(app)
        .get("/posts/my")
        .set("Authorization", authHeader)
        .query({ title: sharedTitle });

      expect(response.status).toBe(200);
      expect(response.body.meta.count).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe(userId);
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
