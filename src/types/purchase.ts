import {
  BusinessSeller,
  Organization,
  PrivateSeller,
  Product,
  ProductsPurchased,
  Purchase,
  Receipt,
  Seller,
  User,
} from "@prisma/client";

export type IPurchase = Purchase & {
  receiptSettings: Receipt;
  user: User;
  seller: Seller & {
    privateSeller: PrivateSeller | null;
    businessSeller: BusinessSeller | null;
  };
  productsPurchased: (ProductsPurchased & { product: Product })[];
  organization: Organization;
};
