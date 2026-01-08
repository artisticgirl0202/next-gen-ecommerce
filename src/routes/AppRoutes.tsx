
"use client";

import { useCallback, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import AuthOverlay from "@/components/auth/AuthOverlay";
import Navbar from "@/components/layout/Navbar";

import CartPage from "@/pages/CartPage";
import CheckoutGatewayPage from "@/pages/CheckoutGatewayPage";
import CheckoutPage from "@/pages/CheckoutPage";
import Detail from "@/pages/Detail";
import Home from "@/pages/Home";
import Login from "@/pages/LoginPage";
import MyPage from "@/pages/MyPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import SignUpPage from "@/pages/SignUpPage";

import Footer from "@/components/layout/Footer";
import AuthSuccessPage from "@/pages/AuthSuccessPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import { useAuth } from "@/store/authStore";
import { useCart } from "@/store/cartStore";
import type { Product } from "@/types";

interface AppRoutesProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addedFeedback: boolean;
  setAddedFeedback: (b: boolean) => void;
}

export default function AppRoutes({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  addedFeedback,
  setAddedFeedback,
}: AppRoutesProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const { user, logout } = useAuth();
  const addItem = useCart((state) => state.addItem);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 2. Navbar를 숨길 경로에 '/auth-success' 추가
  // (이 페이지는 독립적인 디자인을 가지므로 네비게이션 바를 가립니다)
  const hideNavbarRoutes = ["/login", "/signup", "/auth-success"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  const handleViewAction = useCallback((v: string) => {
    switch (v) {
      case "home":
        setActiveCategory("HOME");
        navigate("/");
        break;
      case "cart": navigate("/cart"); break;
      case "mypage": navigate("/mypage"); break;
      case "login": navigate("/login"); break;
      case "logout": handleLogout(); break;
      case "signup":
        navigate("/signup");
        break;
    }
  }, [navigate, setActiveCategory]);

  const handleLogoClick = useCallback(() => {
    if (activeCategory !== "HOME") {
      setActiveCategory("HOME");
      navigate("/");
    }
  }, [navigate, setActiveCategory, activeCategory]);

  const handleAddToCart = (p: Product) => {
    addItem({
      id: p.id,
      title: p.name,
      price: p.price,
      image: p.image,
      qty: 1
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1000);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {!shouldHideNavbar && (
        <Navbar
          {...({ user, onView: handleViewAction, onLogoClick: handleLogoClick, onCategorySelect: setActiveCategory, searchQuery, setSearchQuery, addedFeedback } as any)}
        />
      )}

      <AuthOverlay
        isLoggingOut={isLoggingOut}
        showVerify={showVerify}
        onVerify={(code) => {
          console.log("Verified:", code);
          setShowVerify(false);
        }}
      />

      <main className={`flex-1 ${shouldHideNavbar ? "" : "pt-24"} pb-20 px-0 md:px-8 max-w-screen-2xl mx-auto w-full`}>
        <Routes>
          <Route
            path="/"
            element={
              (<Home {...({ activeCategory, setActiveCategory, onOpen: (p: Product) => navigate(`/detail/${p.id}`, { state: { product: p } }), searchQuery } as any)} />) as any
            }
          />
          <Route
            path="/cart"
            element={<CartPage onBack={() => navigate(-1)} />}
          />
          <Route
            path="/login"
            element={<Login onLogin={() => navigate("/auth-success")} />}
          />
          <Route
            path="/signup"
            element={<SignUpPage />}
          />
          <Route
            path="/detail/:id"
            element={<Detail onAdd={handleAddToCart} addedFeedback={addedFeedback} />}
          />
          <Route
            path="/cart"
            element={<CartPage onBack={() => navigate(-1)} />}
          />
          <Route
            path="/mypage"
            element={user ? <MyPage currentUser={user} /> : <Navigate to="/login" replace />}
          />


          <Route
            path="/login"
            element={<Login onLogin={() => navigate("/auth-success")} />}
          />

          <Route
            path="/signup"
            element={<SignUpPage />}
          />

          <Route path="/auth-success" element={<AuthSuccessPage />} />
          <Route path="/auth-success" element={<AuthSuccessPage />} />
          <Route path="/checkout-gateway" element={<CheckoutGatewayPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
