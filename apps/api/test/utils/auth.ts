import jwt from "jsonwebtoken";
import { UserEntity } from "../../src/entities/user.entity.js";

export function generateAccessToken(user: Pick<UserEntity, "id" | "email">): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" },
  );
}

export function getAuthHeader(user: Pick<UserEntity, "id" | "email">): string {
  return `Bearer ${generateAccessToken(user)}`;
}
