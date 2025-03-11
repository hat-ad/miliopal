import AuthRepository from "@/repository/auth.repository";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { UserUpdateData } from "@/interfaces/user";

class AuthService {
  static async login(email: string, password: string): Promise<User | null> {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("Password not set for this user");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }
  static async updateUser(
    id: string,
    data: UserUpdateData
  ): Promise<User | null> {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return AuthRepository.updateUser(id, updateData);
  }
}

export default AuthService;
