// export const CATEGORY_PRODUCTS = [
//   { id: 1, category: "컴퓨팅 기기", name: "Quantum Laptop", price: 1200, brand: "NextGen", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800" },
//   { id: 2, category: "모바일 & 웨어러블", name: "Neural Watch", price: 350, brand: "BioTech", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
//   { id: 3, category: "오디오 기기", name: "Sonic Buds", price: 180, brand: "AudioX", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
//   { id: 4, category: "영상·디스플레이 기기", name: "8K OLED Monitor", price: 990, brand: "Vision", image: "https://picsum.photos/seed/monitor/600/800" },
//   { id: 5, category: "카메라 & 촬영 장비", name: "Alpha Cam Z", price: 1500, brand: "LensMaster", image: "https://picsum.photos/seed/camera/600/800" },
//   { id: 6, category: "주변기기 & 액세서리", name: "Haptic Mouse", price: 80, brand: "Input", image: "https://picsum.photos/seed/mouse/600/800" },
//   { id: 7, category: "게이밍 기기", name: "VR Holo Deck", price: 700, brand: "GamePro", image: "https://picsum.photos/seed/vr/600/800" },
//   { id: 8, category: "스마트 홈 & IoT", name: "AI Hub Mini", price: 120, brand: "SmartLife", image: "https://picsum.photos/seed/iot/600/800" },
//   { id: 9, category: "네트워크 & 통신 장비", name: "6G Router", price: 250, brand: "NetSpeed", image: "https://picsum.photos/seed/wifi/600/800" },
//   { id: 10, category: "전원 & 충전 장치", name: "Solar Power Bank", price: 90, brand: "EcoCharge", image: "https://picsum.photos/seed/power/600/800" },
//   { id: 11, category: "부품 & 하드웨어", name: "RTX 5090 Ti", price: 2100, brand: "GPU-Tech", image: "https://picsum.photos/seed/gpu/600/800" },
//   { id: 12, category: "특수 목적 전자기기", name: "Lab Scanner X", price: 3400, brand: "ScienceCo", image: "https://picsum.photos/seed/scanner/600/800" },
//   { id: 13, category: "AI·차세대 디바이스", name: "Neural Link Band", price: 5000, brand: "MindTech", image: "https://picsum.photos/seed/ai/600/800" },
// ];

export const CATEGORIES = [
  "All",
  "Computing Devices",
  "Mobile & Wearables",
  "Audio Devices",
  "Video & Display",
  "Cameras & Imaging",
  "Peripherals",
  "Gaming Gear",
  "Smart Home & IoT",
  "Network & Comm",
  "Power & Charging",
  "Components",
  "AI & Next-Gen"
];
export const CATEGORY_PRODUCTS = [
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
    category: "Special Purpose",
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
