import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entities/user.entity.js";

export class UserService {
  private userRepository = AppDataSource.getRepository(UserEntity);

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async getUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async createUser(data: {name: string; email: string }) {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}

export const userService = new UserService();
