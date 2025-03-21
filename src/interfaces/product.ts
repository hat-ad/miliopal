export interface CreateProductInterface {
  name: string;
  price: number;
  organizationId: string;
  isDeleted?: boolean;
  isArchived?: boolean;
}

export interface UpdateProductInterface {
  name?: string;
  price?: number;
  isDeleted?: boolean;
  isArchived?: boolean;
}

export interface GetProductsFilterInterface {
  name?: string;
  price?: number;
  isArchived?: boolean;
  organizationId?: string;
}
