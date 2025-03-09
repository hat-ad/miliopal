import SellerRepository from "@/repository/seller.repository";
import {
  Organization,
  Purchase,
  Seller,
  SellerType,
  User,
} from "@prisma/client";

class SellerService {
  static async createSeller(data: {
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
    return SellerRepository.createSeller(data);
  }

  static async getSeller(id: string): Promise<Seller | null> {
    return SellerRepository.getSeller(id);
  }

  static async getSellerByEmail(email: string): Promise<Seller | null> {
    return SellerRepository.getSellerByEmail(email);
  }

  static async getSellersList(
    filters: {
      email?: string;
      organizationId?: string;
      type?: SellerType;
      name?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      companyName?: string;
      contactPerson?: string;
      organizationNumber?: string;
      isArchived?: boolean;
    },
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    return SellerRepository.getSellersList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }

  static async updateSeller(
    id: string,
    data: {
      email: string;
      type: SellerType;
      name?: string;
      phone: string;
      address: string;
      postalCode: string;
      city: string;
      companyName?: string;
      contactPerson?: string;
      organizationNumber?: string;
      isDeleted?: boolean;
      isArchived?: boolean;
    }
  ): Promise<Seller | null> {
    return SellerRepository.updateSeller(id, data);
  }

  static async deleteSeller(id: string): Promise<Seller | null> {
    return SellerRepository.deleteSeller(id);
  }

  static async getSellerSellingHistory(id: string): Promise<{
    seller: Seller;
    purchase: (Purchase & { user?: User | null })[];
    organization: Organization | null;
  } | null> {
    return SellerRepository.getSellerSellingHistory(id);
  }
}

export default SellerService;
