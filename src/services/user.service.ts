import UserRepository from "@/repository/user.respository";
import bcrypt from "bcrypt";
import { Role, User } from "@prisma/client";

class UserService {
  static async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role: Role;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return UserRepository.createUser({ ...data, password: hashedPassword });
  }

  static async getUser(id: string): Promise<User | null> {
    return UserRepository.getUser(id);
  }

  static async loginUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    return user;
  }
}

export default UserService;
