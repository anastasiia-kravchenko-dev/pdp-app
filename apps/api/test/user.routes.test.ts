import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { AppDataSource } from "../src/data-source.js";
import { UserEntity } from "../src/entities/user.entity.js";
import { getAuthHeader } from "./utils/auth.js";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Users API Integration Tests", () => {
  let userId: number;
  let authHeader: string;

  beforeAll(async () => {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = userRepository.create({
      name: "Test User",
      email: "test_user@gmail.com",
      password: "not-a-real-hash",
      isVerified: false,
    });

    await userRepository.save(user);
    userId = user.id;
    authHeader = getAuthHeader(user);
  });

  describe("GET /users", () => {
    it("responds with 200 and a list of users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /users/:id", () => {
    it("responds with 200 and one user", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .get("/users/999999999")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /users/:id", () => {
    it("updates the provided fields and returns the full updated user", async () => {
      const response = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", authHeader)
        .send({ name: "Updated Name" });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe("Updated Name");
      // untouched fields must survive a partial update
      expect(response.body.email).toBe("test_user@gmail.com");
    });

    it("should return 400 status for invalid email", async () => {
      const response = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", authHeader)
        .send({ email: "not-an-email" });

      expect(response.status).toBe(400);
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .patch("/users/999999999")
        .set("Authorization", authHeader)
        .send({ name: "Doesn't Matter" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /users/:id", () => {
    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .delete("/users/999999999")
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
    });

    it("deletes the user and returns 204", async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getAfterDelete = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", authHeader);
      expect(getAfterDelete.status).toBe(404);
    });
  });
});
