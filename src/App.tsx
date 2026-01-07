
// "use client";

// import AppRoutes from "@/routes/AppRoutes";
// import { useState } from "react";
// import { BrowserRouter } from "react-router-dom";
// import Navbar from "./components/layout/Navbar";

// export default function App() {
//   // 1. 글로벌 상태 관리
//   const [activeCategory, setActiveCategory] = useState("HOME");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [view, setView] = useState("home");

//   // 장바구니 추가 시 숫자 애니메이션을 위한 피드백 상태
//   const [addedFeedback, setAddedFeedback] = useState(false);

//   return (
//     <BrowserRouter>
//       <div className="min-h-screen bg-slate-950 selection:bg-cyan-500/30">
//         {/* 2. 글로벌 네비게이션 */}
//         <Navbar
//           onView={setView}
//           onCategorySelect={setActiveCategory}
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           addedFeedback={addedFeedback}
//         />

//         {/* 3. 라우팅 영역 */}
//         <main className="pt-20">
//           <AppRoutes
//             activeCategory={activeCategory}
//             setActiveCategory={setActiveCategory}
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery} // 추가됨
//             view={view}
//             setView={setView}
//             addedFeedback={addedFeedback}   // 추가됨
//             setAddedFeedback={setAddedFeedback} // ⭐ 필수: 장바구니 애니메이션을 위해 필요
//           />
//         </main>
//       </div>
//     </BrowserRouter>
//   );
// }

// src/App.tsx
// "use client";

// import AppRoutes from "@/routes/AppRoutes";
// import { useState } from "react";
// import { BrowserRouter } from "react-router-dom";

// export default function App() {
//   const [activeCategory, setActiveCategory] = useState("HOME");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [addedFeedback, setAddedFeedback] = useState(false);

//   return (
//     <BrowserRouter>
//       {/* 불필요한 중복 Navbar를 여기서 제거합니다.
//          Navbar는 AppRoutes 내부에서 단 한 번만 렌더링되어야 합니다.
//       */}
//       <div className="min-h-screen bg-slate-950">
//         <AppRoutes
//           activeCategory={activeCategory}
//           setActiveCategory={setActiveCategory}
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           addedFeedback={addedFeedback}
//           setAddedFeedback={setAddedFeedback}
//         />
//       </div>
//     </BrowserRouter>
//   );
// }

"use client";

import AppRoutes from "@/routes/AppRoutes";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { GlobalCursor } from "./components/GlobalCursor";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  return (
    // ✅ 중요: AppRoutes는 반드시 BrowserRouter 내부에 있어야 합니다.
    <BrowserRouter>
    <GlobalCursor/>
      <div className="min-h-screen bg-slate-950">
        <AppRoutes
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          addedFeedback={addedFeedback}
          setAddedFeedback={setAddedFeedback}
        />
      </div>

    </BrowserRouter>
  );
}
