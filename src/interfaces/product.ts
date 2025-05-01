export interface CreateProductInterface {
  name: string;
  organizationId: string;
  isDeleted?: boolean;
  isArchived?: boolean;
  prices: {
    priceCategoryId: string;
    price: number;
  }[];
}

export interface UpdateProductInterface {
  name?: string;
  isDeleted?: boolean;
  isArchived?: boolean;
  ProductPrice?: {
    id: string;
    price: number;
  }[];
}

export interface GetProductsFilterInterface {
  name?: string;
  isArchived?: boolean;
  organizationId?: string;
  priceCategoryId?: string;
}
