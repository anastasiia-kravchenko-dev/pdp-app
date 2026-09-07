import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entities/user.entity.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

export class AuthService {
  private userRepository = AppDataSource.getRepository(UserEntity);

  private async generateTokens(user: UserEntity) {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): jwt.JwtPayload {
    let decoded: string | jwt.JwtPayload;

    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch (error) {
      throw new HttpError(401, "Invalid refreshToken credentials");
    }

    if (typeof decoded === "string" || !decoded.sub) {
      throw new HttpError(401, "Invalid refreshToken credentials");
    }

    return decoded;
  }

  resolveUserIdFromRefreshToken(token: string): number {
    const payload = this.verifyRefreshToken(token);
    return Number(payload.sub);
  }

  async register(data: RegisterInput) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      isVerified: false,
    });

    await this.userRepository.save(user);

    const { password, refreshTokenHash, ...newUser } = user;

    return newUser;
  }

  async login(data: LoginInput) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new HttpError(401, "Invalid login credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid login credentials");
    }

    const tokens = await this.generateTokens(existingUser);

    const { password, refreshTokenHash, ...user } = existingUser;

    return {
      tokens,
      user,
    };
  }

  async refreshToken(token: string) {
    const payload = this.verifyRefreshToken(token);

    const user = await this.userRepository.findOne({
      where: { id: Number(payload.sub) },
    });

    if (!user || !user.refreshTokenHash) {
      throw new HttpError(401, "Access denied");
    }

    const isRefreshValid = await bcrypt.compare(token, user.refreshTokenHash);

    if (!isRefreshValid) {
      throw new HttpError(401, "Access denied");
    }

    return this.generateTokens(user);
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { refreshTokenHash: null });
  }

  async getMy(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    const { password, refreshTokenHash, ...me } = user;

    return me;
  }
}

export const authService = new AuthService();
