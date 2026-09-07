import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { app } from "../src/app.js";
import { AppDataSource } from "../src/data-source.js";
import { UserEntity } from "../src/entities/user.entity.js";

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

function uniqueEmail(label: string): string {
  return `auth_${label}_${randomUUID()}@example.com`;
}

describe("Auth API Integration Tests", () => {
  const createdEmails: string[] = [];

  afterAll(async () => {
    const userRepository = AppDataSource.getRepository(UserEntity);

    for (const email of createdEmails) {
      await userRepository.delete({ email });
    }
  });

  describe("POST /auth/register", () => {
    it("registers a new user and returns it without sensitive fields", async () => {
      const email = uniqueEmail("register");
      createdEmails.push(email);

      const response = await request(app).post("/auth/register").send({
        name: "Register User",
        email,
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        email,
        name: "Register User",
        isVerified: false,
      });
      expect(response.body).toHaveProperty("id");
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("refreshTokenHash");
    });

    it("rejects a duplicate email with 409", async () => {
      const email = uniqueEmail("duplicate");
      createdEmails.push(email);

      await request(app).post("/auth/register").send({
        name: "First",
        email,
        password: "password123",
      });

      const response = await request(app).post("/auth/register").send({
        name: "Second",
        email,
        password: "password456",
      });

      expect(response.status).toBe(409);
    });

    it("rejects an invalid email with 400", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Invalid Email",
        email: "not-an-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
    });

    it("rejects a password shorter than 8 characters with 400", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Short Password",
        email: uniqueEmail("short-password"),
        password: "short",
      });

      expect(response.status).toBe(400);
    });

    it("rejects a name shorter than 2 characters with 400", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "a",
        email: uniqueEmail("short-name"),
        password: "password123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    const credentials = { email: uniqueEmail("login"), password: "password123" };

    beforeAll(async () => {
      createdEmails.push(credentials.email);
      await request(app)
        .post("/auth/register")
        .send({ name: "Login User", ...credentials });
    });

    it("logs in with correct credentials and returns tokens + user", async () => {
      const response = await request(app).post("/auth/login").send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(credentials.email);
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.tokens).toHaveProperty("accessToken");
      expect(response.body.tokens).toHaveProperty("refreshToken");
    });

    it("rejects a wrong password with 401", async () => {
      const response = await request(app).post("/auth/login").send({
        email: credentials.email,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
    });

    it("rejects a non-existent email with 401", async () => {
      const response = await request(app).post("/auth/login").send({
        email: uniqueEmail("nonexistent"),
        password: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("rejects a missing password with 400", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: credentials.email });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/refresh and POST /auth/logout", () => {
    const credentials = { email: uniqueEmail("refresh"), password: "password123" };
    let refreshToken: string;

    beforeAll(async () => {
      createdEmails.push(credentials.email);
      await request(app)
        .post("/auth/register")
        .send({ name: "Refresh User", ...credentials });

      const loginResponse = await request(app).post("/auth/login").send(credentials);
      refreshToken = loginResponse.body.tokens.refreshToken;
    });

    it("rejects a malformed refresh token with 401", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "not-a-real-token" });

      expect(response.status).toBe(401);
    });

    it("rejects a missing refreshToken with 400", async () => {
      const response = await request(app).post("/auth/refresh").send({});

      expect(response.status).toBe(400);
    });

    it("issues a new token pair for a valid refresh token", async () => {
      const response = await request(app).post("/auth/refresh").send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      // rotate to the newest token for the logout test below
      refreshToken = response.body.refreshToken;
    });

    it("logs out and invalidates the refresh token", async () => {
      const logoutResponse = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });

      expect(logoutResponse.status).toBe(204);

      const reuseResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });

      expect(reuseResponse.status).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    const credentials = { email: uniqueEmail("me"), password: "password123" };
    let accessToken: string;

    beforeAll(async () => {
      createdEmails.push(credentials.email);
      await request(app)
        .post("/auth/register")
        .send({ name: "Me User", ...credentials });

      const loginResponse = await request(app).post("/auth/login").send(credentials);
      accessToken = loginResponse.body.tokens.accessToken;
    });

    it("returns the authenticated user's profile", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(credentials.email);
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("refreshTokenHash");
    });

    it("rejects a request with no Authorization header with 401", async () => {
      const response = await request(app).get("/auth/me");

      expect(response.status).toBe(401);
    });

    it("rejects a malformed Authorization header with 401", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", accessToken);

      expect(response.status).toBe(401);
    });

    it("rejects an invalid access token with 401", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer not-a-real-token");

      expect(response.status).toBe(401);
    });
  });
});
