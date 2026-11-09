import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./lib/cart";
import { VoucherProvider } from "./context/VoucherContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Voucher from "./pages/Voucher";
import VoucherSaya from "./pages/VoucherSaya";
import Cart from "./pages/Cart";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import Warung from "./pages/Warung";
import CanteenDetail from "./pages/CanteenDetail";
import MenuDetail from "./pages/MenuDetail";
import Checkout from "./pages/Checkout";
import PaymentQris from "./pages/PaymentQris";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Receipt from "./pages/Receipt";
import Review from "./pages/Review";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <VoucherProvider>
          <BrowserRouter>
            <Routes>
              {/* Rute dalam AppLayout (dengan TopNav desktop dan BottomNav mobile) */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/voucher" element={<Voucher />} />
                <Route path="/voucher/saya" element={<VoucherSaya />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/status" element={<Status />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/search" element={<Search />} />
                <Route path="/menus" element={<Search />} />
                <Route path="/warung" element={<Warung />} />
                <Route path="/warung/:id" element={<CanteenDetail />} />
                <Route path="/warung/:warungId" element={<CanteenDetail />} />
                <Route path="/canteens" element={<Warung />} />
                <Route path="/canteens/:id" element={<CanteenDetail />} />
              </Route>

              {/* Rute Standalone / Transaksional */}
              <Route
                path="/warung/:warungId/menu/:menuId"
                element={<MenuDetail />}
              />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/qris" element={<PaymentQris />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/status/:orderId" element={<Receipt />} />
              <Route path="/review/:orderId" element={<Review />} />
            </Routes>
          </BrowserRouter>
        </VoucherProvider>
      </CartProvider>
    </QueryClientProvider>
  </StrictMode>
);
