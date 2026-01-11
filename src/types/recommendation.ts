import type { Product } from './product';

export type Recommendation = Product & {
  why?: string;
  confidence?: number;
};
