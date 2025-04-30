export interface CreatePickupDelivery {
  PONumber: string;
  comment: string | null;
  sellerId: string;
  userId: string;
  organizationId: string;
  productsForDelivery: {
    productId: string;
    quantity: number;
  }[];
  priceCategoryId: string;
}

export interface GetPickupDeliveryFilterInterface {
  userId?: string;
  sellerId?: string;
  organizationId?: string;
  isArchived?: boolean;
  PONumber?: string;
}
