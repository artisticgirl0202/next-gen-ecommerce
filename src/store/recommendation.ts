export interface Recommendation {
  id: number;
  name: string;
  title?: string;
  price: number;
  image: string;

  /** AI metadata */
  why?: string;
  confidence?: number;
}
