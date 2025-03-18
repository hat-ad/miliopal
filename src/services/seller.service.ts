import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateSellerInterface,
  GetSellersFilterInterface,
  SellerSellingHistoryInterface,
  UpdateSellerInterface,
} from "@/interfaces/seller";
import { Seller } from "@prisma/client";

class SellerService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }
  async createSeller(data: CreateSellerInterface): Promise<Seller> {
    return this.repositoryFactory.getSellerRepository().createSeller(data);
  }

  async getSeller(id: string): Promise<Seller | null> {
    return this.repositoryFactory.getSellerRepository().getSeller(id);
  }

  async getSellerByEmail(email: string): Promise<Seller | null> {
    return this.repositoryFactory.getSellerRepository().getSellerByEmail(email);
  }

  async getSellersList(
    filters: GetSellersFilterInterface,
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    return this.repositoryFactory
      .getSellerRepository()
      .getSellersList(filters, sortBy, sortOrder, page, limit);
  }

  async updateSeller(
    id: string,
    data: UpdateSellerInterface
  ): Promise<Seller | null> {
    return this.repositoryFactory.getSellerRepository().updateSeller(id, data);
  }

  async deleteSeller(id: string): Promise<Seller | null> {
    return this.repositoryFactory.getSellerRepository().deleteSeller(id);
  }

  async getSellerSellingHistory(
    id: string
  ): Promise<SellerSellingHistoryInterface | null> {
    return this.repositoryFactory
      .getSellerRepository()
      .getSellerSellingHistory(id);
  }
}

export default SellerService;
