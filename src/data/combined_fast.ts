// src/data/combined_fast.ts
import demoData from './demo_products_500.json';

// ✅ 1. 기본 상품 데이터 (직접 삽입하여 누락 방지)
const CATEGORY_PRODUCTS = [
  {
    id: 1,
    category: "Computing Devices",
    name: "Quantum Blade Laptop",
    brand: "NextGen",
    price: 2499,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    description: "Next-generation liquid-cooled laptop with AI-optimized neural cores."
  },
  {
    id: 2,
    category: "Mobile & Wearables",
    name: "Neural Link Watch",
    brand: "BioTech",
    price: 599,
    image: "https://images.unsplash.com/photo-1544117518-2b476eb121ec?w=800&q=80",
    description: "Advanced biometric tracking with integrated hologram display."
  },
  {
    id: 3,
    category: "Audio Devices",
    name: "Sonic Echo Pods",
    brand: "AudioX",
    price: 299,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    description: "Lossless spatial audio with active neural noise cancellation."
  },
  {
    id: 4,
    category: "Video & Display",
    name: "OLED Curve 8K",
    brand: "Vision",
    price: 3200,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    description: "Ultra-thin 8K OLED display with 240Hz refresh rate."
  },
  {
    id: 5,
    category: "Cameras & Imaging",
    name: "Alpha Lens Z9",
    brand: "Optic",
    price: 4500,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    description: "Full-frame mirrorless camera with AI-driven autofocus."
  },
  {
    id: 6,
    category: "Peripherals",
    name: "Haptic Pro Keyboard",
    brand: "Input",
    price: 199,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
    description: "Mechanical keyboard with customizable haptic feedback switches."
  },
  {
    id: 7,
    category: "Gaming Gear",
    name: "VR Ghost Headset",
    brand: "Cyber",
    price: 899,
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
    description: "Immersive 4K VR headset with full-body tracking integration."
  },
  {
    id: 8,
    category: "Smart Home & IoT",
    name: "Nexus Home Hub",
    brand: "Unity",
    price: 149,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    description: "Centralized AI control for your entire smart home ecosystem."
  },
  {
    id: 9,
    category: "Network & Comm",
    name: "Vector Wi-Fi 7",
    brand: "Signal",
    price: 349,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
    description: "Ultra-fast Wi-Fi 7 router with multi-gigabit mesh support."
  },
  {
    id: 10,
    category: "Power & Charging",
    name: "Solar Bank X",
    brand: "Eco",
    price: 79,
    image: "https://images.unsplash.com/photo-1617788131756-0b39129bd265?w=800&q=80",
    description: "Portable solar charger with fast-charge neural protection."
  },
  {
    id: 11,
    category: "Components",
    name: "Titan GPU v5",
    brand: "Core",
    price: 1599,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    description: "World-leading graphics processor for real-time ray tracing."
  },
  {
    id: 12,
    category: "Special Purpose", // 나중에 AI & Next-Gen으로 매핑됨
    name: "Bio-Scanner Pro",
    brand: "Medical",
    price: 5200,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    description: "Professional grade portable health diagnostic scanner."
  },
  {
    id: 13,
    category: "AI & Next-Gen",
    name: "Aether AI Processor",
    brand: "Mind",
    price: 9999,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    description: "Standalone AI processing unit for localized neural networks."
  }
];

// ✅ 2. 카테고리 정의
export const TARGET_CATEGORIES = [
  "All", "Computing Devices", "Mobile & Wearables", "Audio Devices",
  "Video & Display", "Cameras & Imaging", "Peripherals", "Gaming Gear",
  "Smart Home & IoT", "Network & Comm", "Power & Charging", "Components", "AI & Next-Gen"
];

// ✅ 3. 카테고리 자동 매핑 함수
const mapCategory = (rawCategory: string, productName: string): string => {
  const text = (rawCategory + " " + productName).toLowerCase();

  // 기본 데이터 예외 처리
  if (rawCategory === "Special Purpose") return "AI & Next-Gen";
  if (TARGET_CATEGORIES.includes(rawCategory)) return rawCategory;

  // 데모 데이터 매핑
  if (text.match(/laptop|desktop|macbook|pc|server|tablet|ipad|computing/)) return "Computing Devices";
  if (text.match(/phone|watch|wearable|mobile|android|ios|galaxy|iphone/)) return "Mobile & Wearables";
  if (text.match(/audio|sound|speaker|headphone|earbud|mic|music/)) return "Audio Devices";
  if (text.match(/tv|monitor|display|projector|screen|video|oled/)) return "Video & Display";
  if (text.match(/camera|lens|drone|imaging|photo|cam|scanner/)) return "Cameras & Imaging";
  if (text.match(/keyboard|mouse|printer|scanner|peripheral|input/)) return "Peripherals";
  if (text.match(/game|console|xbox|playstation|nintendo|vr|gaming/)) return "Gaming Gear";
  if (text.match(/home|iot|smart|bulb|plug|sensor|robot/)) return "Smart Home & IoT";
  if (text.match(/router|wifi|network|switch|comm|5g/)) return "Network & Comm";
  if (text.match(/battery|charge|power|solar|cable/)) return "Power & Charging";
  if (text.match(/cpu|gpu|ram|ssd|hdd|motherboard|case|cooler|component|titan/)) return "Components";

  return "AI & Next-Gen";
};

// ✅ 4. 병합 로직 (기본 데이터 우선)
export const MERGED_PRODUCTS = [
  // 1) 기본 데이터 (그대로 사용)
  ...CATEGORY_PRODUCTS.map(p => ({
    ...p,
    category: mapCategory(p.category, p.name)
  })),
  // 2) 데모 데이터 (ID + 10000 하여 충돌 방지)
  ...(demoData as any[]).map(p => ({
    ...p,
    id: Number(p.id) + 10000,
    price: Number(p.price) || 0,
    category: mapCategory(p.category || "", p.name)
  }))
];
