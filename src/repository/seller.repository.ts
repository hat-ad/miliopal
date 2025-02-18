import PrismaService from "@/db/prisma-service";
import { PrismaClient, SellerType, Seller } from "@prisma/client";

class SellerRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createSeller(data: {
    name?: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    isDeleted?: boolean;
    type: SellerType;
  }): Promise<Seller> {
    return this.db.seller.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        isDeleted: data.isDeleted,
        type: data.type,
      },
    });
  }

  async getSeller(id: string): Promise<Seller | null> {
    return this.db.seller.findUnique({
      where: { id },
    });
  }

  async getSellerByEmail(email: string): Promise<Seller | null> {
    return this.db.seller.findUnique({
      where: { email },
    });
  }

  // async getSellersList(
  //   filters: {
  //     name?: string;
  //     email?: string;
  //     phone?: string;
  //     address?: string;
  //     postalCode?: string;
  //     city?: string;
  //     type?: SellerType;
  //   },
  //   sortBy: "name" | "city" = "name",
  //   sortOrder: "asc" | "desc" = "asc"
  // ): Promise<Seller[]> {
  //   return this.db.seller.findMany({
  //     where: {
  //       name: filters.name
  //         ? { contains: filters.name, mode: "insensitive" }
  //         : undefined,
  //       email: filters.email
  //         ? { contains: filters.email, mode: "insensitive" }
  //         : undefined,
  //       phone: filters.phone
  //         ? { contains: filters.phone, mode: "insensitive" }
  //         : undefined,
  //       address: filters.address
  //         ? { contains: filters.address, mode: "insensitive" }
  //         : undefined,
  //       postalCode: filters.postalCode
  //         ? { contains: filters.postalCode, mode: "insensitive" }
  //         : undefined,
  //       city: filters.city
  //         ? { contains: filters.city, mode: "insensitive" }
  //         : undefined,
  //       type: filters.type ? filters.type : undefined,
  //       isDeleted: false, // Exclude deleted sellers
  //     },
  //     orderBy: {
  //       [sortBy]: sortOrder,
  //     },
  //   });
  // }

  async getSellersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      type?: SellerType;
    },
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const total = await this.db.seller.count({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,
        phone: filters.phone
          ? { contains: filters.phone, mode: "insensitive" }
          : undefined,
        address: filters.address
          ? { contains: filters.address, mode: "insensitive" }
          : undefined,
        postalCode: filters.postalCode
          ? { contains: filters.postalCode, mode: "insensitive" }
          : undefined,
        city: filters.city
          ? { contains: filters.city, mode: "insensitive" }
          : undefined,
        type: filters.type ? filters.type : undefined,
        isDeleted: false,
      },
    });

    const sellers = await this.db.seller.findMany({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,
        phone: filters.phone
          ? { contains: filters.phone, mode: "insensitive" }
          : undefined,
        address: filters.address
          ? { contains: filters.address, mode: "insensitive" }
          : undefined,
        postalCode: filters.postalCode
          ? { contains: filters.postalCode, mode: "insensitive" }
          : undefined,
        city: filters.city
          ? { contains: filters.city, mode: "insensitive" }
          : undefined,
        type: filters.type ? filters.type : undefined,
        isDeleted: false,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: offset,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return { sellers, total, totalPages };
  }

  async updateSeller(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      isDeleted?: boolean;
      type?: string;
    }
  ): Promise<Seller> {
    return this.db.seller.update({
      where: { id },
      data: {
        ...data,
        type: data.type as SellerType | undefined,
      },
    });
  }

  async deleteSeller(id: string): Promise<Seller> {
    return this.db.seller.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}

export default new SellerRepository();
