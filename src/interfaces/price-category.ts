export interface CreatePriceCategoryInterface {
  organizationId: string;
  name: string;
}

export interface GetPriceCategoryFilterInterface {
  organizationId: string;
  name?: string;
  isArchived?: boolean;
}

export interface UpdatePriceCategoryInterface {
  name?: string;
  isArchived?: boolean;
}
