import PrismaService from "@/db/prisma-service";
import {
  Organization,
  PrismaClient,
  Purchase,
  Seller,
  SellerType,
  User,
} from "@prisma/client";

class SellerRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createSeller(data: {
    email: string;
    organizationId: string;
    type: SellerType;
    name?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    companyName?: string;
    contactPerson?: string;
    organizationNumber?: string;
    isDeleted?: boolean;
  }): Promise<Seller> {
    if (data.type === "PRIVATE" && !data.name) {
      throw new Error("Private Seller must have a name.");
    }
    if (data.type === "BUSINESS" && !data.organizationNumber) {
      throw new Error("Business Seller must have company details.");
    }

    return this.db.seller.create({
      data: {
        email: data.email,
        organizationId: data.organizationId,
        type: data.type,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        isDeleted: data.isDeleted ?? false,

        privateSeller:
          data.type === "PRIVATE"
            ? { create: { name: data.name! } }
            : undefined,

        businessSeller:
          data.type === "BUSINESS"
            ? {
                create: {
                  companyName: data.companyName!,
                  contactPerson: data.contactPerson!,
                  organizationNumber: data.organizationNumber!,
                },
              }
            : undefined,
      },
      include: {
        privateSeller: true,
        businessSeller: true,
        organization: true,
      },
    });
  }

  async getSeller(id: string): Promise<Seller | null> {
    return this.db.seller.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        privateSeller: true,
        businessSeller: true,
        organization: true,
      },
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
      organizationNumber?: string;
      isArchived?: boolean;
      organizationId?: string;
    },
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const whereCondition: any = {
      email: filters.email
        ? { contains: filters.email, mode: "insensitive" }
        : undefined,
      type: filters.type || undefined,
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
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: "insensitive",
          }
        : undefined,
      isArchived:
        filters.isArchived !== undefined ? filters.isArchived : undefined,
      isDeleted: false,
    };

    if (filters.type === "PRIVATE" && filters.name) {
      whereCondition.privateSeller = {
        name: { contains: filters.name, mode: "insensitive" },
      };
    }
    if (filters.type === "BUSINESS") {
      if (filters.companyName) {
        whereCondition.businessSeller = {
          companyName: { contains: filters.companyName, mode: "insensitive" },
        };
      }
      if (filters.contactPerson) {
        whereCondition.businessSeller = {
          ...whereCondition.businessSeller,
          contactPerson: {
            contains: filters.contactPerson,
            mode: "insensitive",
          },
        };
      }
      if (filters.organizationNumber !== undefined) {
        whereCondition.businessSeller = {
          ...whereCondition.businessSeller,
          organizationNumber: filters.organizationNumber,
        };
      }
    }

    let orderBy: any = {};
    if (sortBy === "name") {
      if (filters.type === "PRIVATE") {
        orderBy = { privateSeller: { name: sortOrder } };
      } else if (filters.type === "BUSINESS") {
        orderBy = { businessSeller: { companyName: sortOrder } };
      } else {
        orderBy = { email: sortOrder };
      }
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const total = await this.db.seller.count({ where: whereCondition });

    const sellers = await this.db.seller.findMany({
      where: whereCondition,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        privateSeller: true,
        businessSeller: true,
      },
    });
    const transformedSellers = sellers.map((seller) => ({
      ...seller,
      ...seller.privateSeller,
      ...seller.businessSeller,
      privateSeller: undefined,
      businessSeller: undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return { sellers: transformedSellers, total, totalPages };
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
      organizationNumber?: string;
      isDeleted?: boolean;
      isArchived?: boolean;
      type?: SellerType;
    }
  ): Promise<Seller> {
    const existingSeller = await this.db.seller.findUnique({
      where: { id },
      include: {
        privateSeller: true,
        businessSeller: true,
      },
    });

    if (!existingSeller) {
      throw new Error("Seller not found");
    }

    const updateData: any = {
      phone: data.phone,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      isDeleted: data.isDeleted,
      isArchived: data.isArchived,
    };

    if (existingSeller.type === "BUSINESS" && existingSeller.businessSeller) {
      updateData.businessSeller = {
        update: {
          contactPerson: data.contactPerson || undefined,
          companyName: data.companyName || undefined,
          organizationNumber: data.organizationNumber || undefined,
        },
      };
    }

    if (existingSeller.type === "PRIVATE" && existingSeller.privateSeller) {
      updateData.privateSeller = {
        update: {
          name: data.name || undefined,
        },
      };
    }

    return this.db.seller.update({
      where: { id },
      data: updateData,
      include: {
        privateSeller: true,
        businessSeller: true,
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

  async getSellerSellingHistory(id: string): Promise<{
    seller: Seller;
    purchase: (Purchase & { user?: User | null })[];
    organization: Organization | null;
  } | null> {
    const sellerSellingHistory = await this.db.seller.findUnique({
      where: { id },
      include: {
        privateSeller: true,
        businessSeller: true,
        organization: true,
        purchases: {
          include: {
            user: true,
            productsPurchased: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!sellerSellingHistory) {
      return null;
    }

    const {
      privateSeller,
      businessSeller,
      purchases,
      organization,
      ...sellerDetails
    } = sellerSellingHistory;

    return {
      seller: {
        ...sellerDetails,
        ...(privateSeller || null),
        ...(businessSeller || null),
      },
      purchase: purchases.map((purchase) => ({
        ...purchase,
        user: purchase.user
          ? {
              ...purchase.user,
              email: purchase.user.email ?? null,
              phone: purchase.user.phone ?? null,
            }
          : null,
      })),
      organization: organization ?? null,
    };
  }
}

export default new SellerRepository();
