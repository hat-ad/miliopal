import PrismaService from "@/db/prisma-service";
import { PrismaClient, SellerType, Seller } from "@prisma/client";

class SellerRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createSeller(data: {
    email: string;
    type: SellerType;
    name?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    companyName?: string;
    contactPerson?: string;
    organizationNumber?: number;
    isDeleted?: boolean;
  }): Promise<Seller> {
    return this.db.seller.create({
      data: {
        email: data.email,
        type: data.type,
        name: data.name,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        organizationNumber: data.organizationNumber,
        isDeleted: data.isDeleted,
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

  async getSellersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      type?: SellerType;
      companyName?: string;
      contactPerson?: string;
      organizationNumber?: number;
    },
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const total = await this.db.seller.count({
      where: {
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,
        type: filters.type ? filters.type : undefined,

        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
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
        companyName: filters.companyName
          ? { contains: filters.companyName, mode: "insensitive" }
          : undefined,
        contactPerson: filters.contactPerson
          ? { contains: filters.contactPerson, mode: "insensitive" }
          : undefined,
        organizationNumber: filters.organizationNumber || null,
        isDeleted: false,
      },
    });

    const sellers = await this.db.seller.findMany({
      where: {
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,

        type: filters.type ? filters.type : undefined,

        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
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
        companyName: filters.companyName
          ? { contains: filters.companyName, mode: "insensitive" }
          : undefined,
        contactPerson: filters.contactPerson
          ? { contains: filters.contactPerson, mode: "insensitive" }
          : undefined,
        organizationNumber: filters.organizationNumber || null,

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
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      companyName?: string;
      contactPerson?: string;
      organizationNumber?: number;
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
