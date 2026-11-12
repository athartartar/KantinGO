import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./lib/cart";
import { VoucherProvider } from "./context/VoucherContext";
import { OrderProvider } from "./lib/orders";
import { UserProvider } from "./lib/user";
import { isAuthenticated } from "./lib/auth";
import AppLayout from "./components/AppLayout";
import AppSplashWrapper from "./components/AppSplashWrapper";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Voucher from "./pages/Voucher";
import VoucherSaya from "./pages/VoucherSaya";
import Cart from "./pages/Cart";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfilePassword from "./pages/ProfilePassword";
import ProfileReviews from "./pages/ProfileReviews";
import ProfileInfo from "./pages/ProfileInfo";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import Warung from "./pages/Warung";
import CanteenDetail from "./pages/CanteenDetail";
import MenuDetail from "./pages/MenuDetail";
import WarungProfile from "./pages/WarungProfile";
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
        <OrderProvider>
          <UserProvider>
            <VoucherProvider>
              <BrowserRouter>
                <AppSplashWrapper>
                  <Routes>
                    {/* Halaman autentikasi (tanpa AppLayout) */}
                    <Route path="/splash" element={<SplashScreen />} />
                    <Route path="/login" element={<Login />} />

                    {/* Halaman aplikasi yang memerlukan login */}
                    <Route
                      element={
                        <RequireAuth>
                          <AppLayout />
                        </RequireAuth>
                      }
                    >
                      <Route path="/" element={<Home />} />
                      <Route path="/voucher" element={<Voucher />} />
                      <Route path="/voucher/saya" element={<VoucherSaya />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/status" element={<Status />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/edit" element={<ProfileEdit />} />
                      <Route
                        path="/profile/password"
                        element={<ProfilePassword />}
                      />
                      <Route
                        path="/profile/reviews"
                        element={<ProfileReviews />}
                      />
                      <Route
                        path="/profile/info/:slug"
                        element={<ProfileInfo />}
                      />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/menus" element={<Search />} />
                      <Route path="/warung" element={<Warung />} />
                      <Route path="/warung/:id" element={<CanteenDetail />} />
                      <Route
                        path="/warung/:warungId"
                        element={<CanteenDetail />}
                      />
                      <Route path="/canteens" element={<Warung />} />
                      <Route path="/canteens/:id" element={<CanteenDetail />} />
                    </Route>

                    {/* Rute Standalone / Transaksional */}
                    <Route
                      path="/warung/:warungId/menu/:menuId"
                      element={<MenuDetail />}
                    />
                    <Route
                      path="/warung/:warungId/profil"
                      element={<WarungProfile />}
                    />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/qris" element={<PaymentQris />} />
                    <Route
                      path="/checkout/success"
                      element={<CheckoutSuccess />}
                    />
                    <Route path="/status/:orderId" element={<Receipt />} />
                    <Route path="/review/:orderId" element={<Review />} />

                    {/* Fallback: belum login arahkan ke login, sudah login arahkan ke beranda */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={isAuthenticated() ? "/" : "/login"}
                          replace
                        />
                      }
                    />
                  </Routes>
                </AppSplashWrapper>
              </BrowserRouter>
            </VoucherProvider>
          </UserProvider>
        </OrderProvider>
      </CartProvider>
    </QueryClientProvider>
  </StrictMode>
);
