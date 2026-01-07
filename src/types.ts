// export type Product = {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   brand: string;
//   rating: number;
//   image: string;
//   images?: string[];
//   description?: string;
//   subCategory?: string;
//   specs?: Record<string,string>;
//   warranty?: string;
// };
// src/types.ts
export type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating?: number;
  description?: string;
  categories?: string[];
  specs?: Record<string, string>;
};
