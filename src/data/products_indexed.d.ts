declare module "@/data/products_indexed" {
  export function getProductById(id: number): any;
  export const PRODUCTS_BY_ID: Map<number, any>;
  export function getProductsByCategory(category: string, opts?: any): any;
  export default any;
}
