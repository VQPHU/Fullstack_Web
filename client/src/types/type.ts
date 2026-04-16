export interface Category {
  _id: string;
  name: string;
  image: string;
  categoryType: string;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
}

export interface ProductType {
  _id: string;
  name: string;
  type: string;
  description?: string;
  status: "Active" | "Inactive";
  color?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  image: string;
  category: Category;
  brand: Brand;
  productType?: ProductType;
  ratings: [];
  quantity?: number;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export type Banners = {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
  createdAt: string;
  updatedAt: string;
};
