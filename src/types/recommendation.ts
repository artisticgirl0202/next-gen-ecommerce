import type { Product } from './product';

export type Recommendation = Product & {
  why?: string;
  why_en?: string;
  confidence?: number;
};
