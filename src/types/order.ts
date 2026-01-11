export type OrderItem = {
  productId: number;
  qty: number;
  price: number;
  title?: string;
  image?: string;
  category?: string | null;
};

export type OrderShape = {
  id: number | string;
  userId?: number | string;
  items: OrderItem[];
  total?: number | null;
  status?: string | null;
};
