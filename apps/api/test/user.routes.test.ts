import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { AppDataSource } from "../src/data-source.js";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Users API Integration Tests", () => {
  let userId: number;

  describe("POST /users", () => {
    it("should create a new user and return status 201", async () => {
      const newUserBody = {
        name: "Test User",
        email: "test_user@gmail.com",
      };

      const response = await request(app).post("/users").send(newUserBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newUserBody.name);
      expect(response.body.email).toBe(newUserBody.email);

      userId = response.body.id;
    });

    it("should return 400 status for invalid email", async () => {
      const invalidUserBody = { name: "invalidUser", email: "wrongEmail" };

      const response = await request(app).post("/users").send(invalidUserBody);

      expect(response.status).toBe(400);
    });

    it("should return 400 status for a name that's too short", async () => {
      const invalidUserBody = { name: "a", email: "short_name@gmail.com" };

      const response = await request(app).post("/users").send(invalidUserBody);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /users", () => {
    it("responds with 200 and a list of users", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /users/:id", () => {
    it("responds with 200 and one user", async () => {
      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app).get("/users/999999999");

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /users/:id", () => {
    it("updates the provided fields and returns the full updated user", async () => {
      const response = await request(app)
        .patch(`/users/${userId}`)
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
        .send({ email: "not-an-email" });

      expect(response.status).toBe(400);
    });

    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app)
        .patch("/users/999999999")
        .send({ name: "Doesn't Matter" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /users/:id", () => {
    it("responds with 404 for a non-existent id", async () => {
      const response = await request(app).delete("/users/999999999");

      expect(response.status).toBe(404);
    });

    it("deletes the user and returns 204", async () => {
      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      const getAfterDelete = await request(app).get(`/users/${userId}`);
      expect(getAfterDelete.status).toBe(404);
    });
  });
});
