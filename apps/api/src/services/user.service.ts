import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entities/user.entity.js";
import { CreateUserInput, UpdateUserInput } from "../schemas/user.schema.js";

export class UserService {
  private userRepository = AppDataSource.getRepository(UserEntity);

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async getUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async createUser(data: CreateUserInput) {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async updateUser(id: number, data: UpdateUserInput) {
    const user = await this.userRepository.preload({id, ...data});

    if (!user) {
      return null
    }

    return await this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}

export const userService = new UserService();
