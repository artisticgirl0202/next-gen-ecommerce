"use client";

import AppRoutes from "@/routes/AppRoutes";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import ArchitectureShowcaseLauncher from "./components/ArchitectureShowcaseLauncher";
import GlobalCursor from "./components/GlobalCursor";
import { useAuthInit } from "./hooks/useAuthInit";

function AppInner() {
  const [activeCategory, setActiveCategory] = useState("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Attempt silent session restore from HttpOnly refresh-token cookie on mount
  useAuthInit();

  return (
    <>
      <GlobalCursor />
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
    </>
  );
}

export default function App() {
  return (
    // AppRoutes must be inside BrowserRouter
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
