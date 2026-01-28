

"use client";

import AppRoutes from "@/routes/AppRoutes";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import GlobalCursor from "./components/GlobalCursor";
import ArchitectureShowcaseLauncher from "./components/ArchitectureShowcaseLauncher";


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
        <ArchitectureShowcaseLauncher />
      </div>

    </BrowserRouter>
  );
}


