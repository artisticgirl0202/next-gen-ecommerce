// "use client";

// import { useCallback, useState } from "react";
// import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

// import AuthOverlay from "@/components/auth/AuthOverlay";
// import Navbar from "@/components/layout/Navbar";
// import CartPage from "@/pages/Cart";
// import CheckoutGatewayPage from "@/pages/CheckoutGatewayPage";
// import CheckoutPage from "@/pages/CheckoutPage";
// import Detail from "@/pages/Detail";
// import Home from "@/pages/Home";
// import Login from "@/pages/LoginPage";
// import MyPage from "@/pages/MyPage";
// import PaymentSuccess from "@/pages/PaymentSuccess";

// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import type { Product } from "@/types";

// interface AppRoutesProps {
//   activeCategory: string;
//   setActiveCategory: (cat: string) => void;
//   searchQuery: string;
//   setSearchQuery: (q: string) => void;
//   addedFeedback: boolean;
//   setAddedFeedback: (b: boolean) => void;
// }

// export default function AppRoutes({
//   activeCategory,
//   setActiveCategory,
//   searchQuery,
//   setSearchQuery,
//   addedFeedback,
//   setAddedFeedback,
// }: AppRoutesProps) {
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [showVerify, setShowVerify] = useState(false);

//   const { user, logout } = useAuth();
//   const addItem = useCart((state) => state.addItem);
//   const navigate = useNavigate();

//   // 1. 핸들러 메모이제이션: 불필요한 Navbar 리렌더링 및 루프 방지
//   const handleViewAction = useCallback((v: string) => {
//     switch (v) {
//       case "home":
//         setActiveCategory("HOME");
//         navigate("/");
//         break;
//       case "cart": navigate("/cart"); break;
//       case "mypage": navigate("/mypage"); break;
//       case "login": navigate("/login"); break;
//       case "logout": handleLogout(); break;
//       case "signup": setShowVerify(true); break;
//     }
//   }, [navigate, setActiveCategory]);

//   // AppRoutes.tsx 내부 핸들러 수정
// const handleLogoClick = useCallback(() => {
//   if (activeCategory !== "HOME") { // 이미 HOME이면 재설정 안함
//     setActiveCategory("HOME");
//     navigate("/");
//   }
// }, [navigate, setActiveCategory, activeCategory]);
//   const handleAddToCart = (p: Product) => {
//     addItem({
//       id: p.id,
//       title: p.name,
//       price: p.price,
//       image: p.image,
//       qty: 1
//     });
//     setAddedFeedback(true);
//     setTimeout(() => setAddedFeedback(false), 1000);
//   };

//   const handleLogout = () => {
//     setIsLoggingOut(true);
//     setTimeout(() => {
//       logout();
//       setIsLoggingOut(false);
//       navigate("/");
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
//       <Navbar
//         user={user}
//         onView={handleViewAction}
//         onLogoClick={handleLogoClick}
//         onCategorySelect={setActiveCategory}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         addedFeedback={addedFeedback}
//       />

//       <AuthOverlay
//         isLoggingOut={isLoggingOut}
//         showVerify={showVerify}
//         onVerify={(code) => {
//           console.log("Verified:", code);
//           setShowVerify(false);
//         }}
//         onClose={() => setShowVerify(false)}
//       />

//       <main className="flex-1 pt-24 pb-20 px-0 md:px-8 max-w-screen-2xl mx-auto w-full">

//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 activeCategory={activeCategory}
//                 setActiveCategory={setActiveCategory}
//                 onOpen={(p: Product) => navigate(`/detail/${p.id}`, { state: { product: p } })}
//                 searchQuery={searchQuery}
//               />
//             }
//           />
//           <Route
//             path="/detail/:id"
//             element={<Detail onAdd={handleAddToCart} addedFeedback={addedFeedback} />}
//           />
//           <Route
//             path="/cart"
//             element={<CartPage onBack={() => navigate(-1)} />}
//           />
//           <Route
//             path="/mypage"
//             element={user ? <MyPage currentUser={user} /> : <Navigate to="/login" replace />}
//           />
//           <Route
//             path="/login"
//             element={<Login onLogin={() => navigate("/")} />}
//           />
//           <Route path="/checkout-gateway" element={<CheckoutGatewayPage />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           <Route path="/payment-success" element={<PaymentSuccess />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }
// "use client";

// import { useCallback, useState } from "react";
// import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"; // ✅ useLocation 추가

// import AuthOverlay from "@/components/auth/AuthOverlay";
// import Navbar from "@/components/layout/Navbar";
// import CartPage from "@/pages/CartPage";
// import CheckoutGatewayPage from "@/pages/CheckoutGatewayPage";
// import CheckoutPage from "@/pages/CheckoutPage";
// import Detail from "@/pages/Detail";
// import Home from "@/pages/Home";
// import Login from "@/pages/LoginPage";
// import MyPage from "@/pages/MyPage";
// import PaymentSuccess from "@/pages/PaymentSuccess";
// import SignupPage from "@/pages/SignupPage"; // ✅ 1. SignupPage 임포트

// import { useAuth } from "@/store/authStore";
// import { useCart } from "@/store/cartStore";
// import type { Product } from "@/types";

// interface AppRoutesProps {
//   activeCategory: string;
//   setActiveCategory: (cat: string) => void;
//   searchQuery: string;
//   setSearchQuery: (q: string) => void;
//   addedFeedback: boolean;
//   setAddedFeedback: (b: boolean) => void;
// }

// export default function AppRoutes({
//   activeCategory,
//   setActiveCategory,
//   searchQuery,
//   setSearchQuery,
//   addedFeedback,
//   setAddedFeedback,
// }: AppRoutesProps) {
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [showVerify, setShowVerify] = useState(false);

//   const { user, logout } = useAuth();
//   const addItem = useCart((state) => state.addItem);
//   const navigate = useNavigate();
//   const location = useLocation(); // ✅ 현재 경로 확인용 훅

//   // Navbar를 숨길 경로 목록 정의
//   const hideNavbarRoutes = ["/login", "/signup"];
//   const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

//   // 1. 핸들러 메모이제이션
//   const handleViewAction = useCallback((v: string) => {
//     switch (v) {
//       case "home":
//         setActiveCategory("HOME");
//         navigate("/");
//         break;
//       case "cart": navigate("/cart"); break;
//       case "mypage": navigate("/mypage"); break;
//       case "login": navigate("/login"); break;
//       case "logout": handleLogout(); break;
//       case "signup":
//         // ✅ 2. 기존 오버레이 대신 페이지로 이동하도록 수정
//         navigate("/signup");
//         // setShowVerify(true); // 오버레이를 쓰고 싶다면 이 줄 주석 해제
//         break;
//     }
//   }, [navigate, setActiveCategory]);

//   const handleLogoClick = useCallback(() => {
//     if (activeCategory !== "HOME") {
//       setActiveCategory("HOME");
//       navigate("/");
//     }
//   }, [navigate, setActiveCategory, activeCategory]);

//   const handleAddToCart = (p: Product) => {
//     addItem({
//       id: p.id,
//       title: p.name,
//       price: p.price,
//       image: p.image,
//       qty: 1
//     });
//     setAddedFeedback(true);
//     setTimeout(() => setAddedFeedback(false), 1000);
//   };

//   const handleLogout = () => {
//     setIsLoggingOut(true);
//     setTimeout(() => {
//       logout();
//       setIsLoggingOut(false);
//       navigate("/");
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
//       {/* ✅ 3. 로그인/회원가입 페이지가 아닐 때만 Navbar 렌더링 */}
//       {!shouldHideNavbar && (
//         <Navbar
//           user={user}
//           onView={handleViewAction}
//           onLogoClick={handleLogoClick}
//           onCategorySelect={setActiveCategory}
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           addedFeedback={addedFeedback}
//         />
//       )}

//       {/* AuthOverlay는 필요 시 유지 (회원가입 완료 후 인증 등) */}
//       <AuthOverlay
//         isLoggingOut={isLoggingOut}
//         showVerify={showVerify}
//         onVerify={(code) => {
//           console.log("Verified:", code);
//           setShowVerify(false);
//         }}
//         onClose={() => setShowVerify(false)}
//       />

//       {/* Navbar가 없을 때는 상단 여백(pt-24)을 제거하여 꽉 찬 화면으로 표시 */}
//       <main className={`flex-1 ${shouldHideNavbar ? "" : "pt-24"} pb-20 px-0 md:px-8 max-w-screen-2xl mx-auto w-full`}>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 activeCategory={activeCategory}
//                 setActiveCategory={setActiveCategory}
//                 onOpen={(p: Product) => navigate(`/detail/${p.id}`, { state: { product: p } })}
//                 searchQuery={searchQuery}
//               />
//             }
//           />
//           <Route
//             path="/detail/:id"
//             element={<Detail onAdd={handleAddToCart} addedFeedback={addedFeedback} />}
//           />
//           <Route
//             path="/cart"
//             element={<CartPage onBack={() => navigate(-1)} />}
//           />
//           <Route
//             path="/mypage"
//             element={user ? <MyPage currentUser={user} /> : <Navigate to="/login" replace />}
//           />
//           <Route
//             path="/login"
//             element={<Login onLogin={() => navigate("/")} />}
//           />

//           {/* ✅ 4. Signup 경로 추가 */}
//           <Route
//             path="/signup"
//             element={<SignupPage />}
//           />

//           <Route path="/checkout-gateway" element={<CheckoutGatewayPage />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           <Route path="/payment-success" element={<PaymentSuccess />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }
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
import SignupPage from "@/pages/SignupPage";

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
          user={user}
          onView={handleViewAction}
          onLogoClick={handleLogoClick}
          onCategorySelect={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          addedFeedback={addedFeedback}
        />
      )}

      <AuthOverlay
        isLoggingOut={isLoggingOut}
        showVerify={showVerify}
        onVerify={(code) => {
          console.log("Verified:", code);
          setShowVerify(false);
        }}
        onClose={() => setShowVerify(false)}
      />

      <main className={`flex-1 ${shouldHideNavbar ? "" : "pt-24"} pb-20 px-0 md:px-8 max-w-screen-2xl mx-auto w-full`}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onOpen={(p: Product) => navigate(`/detail/${p.id}`, { state: { product: p } })}
                searchQuery={searchQuery}
              />
            }
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

          {/* ✅ 3. 로그인 성공 시 이동할 경로 수정 */}
          {/* 기존: onLogin={() => navigate("/")} */}
          {/* 수정: onLogin={() => navigate("/auth-success")} */}
          <Route
            path="/login"
            element={<Login onLogin={() => navigate("/auth-success")} />}
          />

          <Route
            path="/signup"
            element={<SignupPage />}
          />

          {/* ✅ 4. 새로운 페이지 라우트 등록 */}
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
