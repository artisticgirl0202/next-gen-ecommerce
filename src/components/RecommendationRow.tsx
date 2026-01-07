// src/components/RecommendationRow.tsx
import type { Product } from "@/types";

type RecommendationItem = Product & {
  why?: string;
};

export default function RecommendationRow({
  items,
  onOpen,
}: {
  items: RecommendationItem[];
  onOpen?: (p: Product) => void;
}) {
  if (!items?.length) return null;

  return (
    <div className="py-2">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpen?.(item)}
            className="w-48 shrink-0 text-left"
          >
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-800">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 text-sm font-bold truncate">{item.name}</div>
            <div className="text-xs text-slate-400">${item.price}</div>
            {item.why && (
              <div className="text-[10px] mt-1 text-cyan-400">{item.why}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

