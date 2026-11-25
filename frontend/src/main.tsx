import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./lib/cart";
import { VoucherProvider } from "./context/VoucherContext";
import { OrderProvider } from "./lib/orders";
import { UserProvider } from "./lib/user";
import { NotificationProvider } from "./lib/notifications";
import { getDefaultHomeForUser, isAuthenticated } from "./lib/auth";
import AppLayout from "./components/AppLayout";
import AppSplashWrapper from "./components/AppSplashWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireAuth, { GuestOnly } from "./components/RequireAuth";
import Home from "./pages/Home";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import PartnerLayout from "./components/partner/PartnerLayout";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrders from "./pages/partner/PartnerOrders";
import PartnerMenus from "./pages/partner/PartnerMenus";
import PartnerWallet from "./pages/partner/PartnerWallet";
import PartnerWarung from "./pages/partner/PartnerWarung";
import PartnerPending from "./pages/PartnerPending";
import Receipt from "./pages/Receipt";
import Review from "./pages/Review";
import SimulasiBayar from "./pages/SimulasiBayar";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <CartProvider>
        <OrderProvider>
          <NotificationProvider>
            <UserProvider>
            <VoucherProvider>
              <BrowserRouter>
                <AppSplashWrapper>
                  <Routes>
                    {/* Halaman autentikasi (tanpa AppLayout) */}
                    <Route path="/splash" element={<SplashScreen />} />
                    <Route
                      path="/login"
                      element={
                        <GuestOnly>
                          <Login />
                        </GuestOnly>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <GuestOnly>
                          <Register />
                        </GuestOnly>
                      }
                    />
                    <Route path="/simulasi-bayar/:code" element={<SimulasiBayar />} />
                    <Route
                      path="/mitra/menunggu"
                      element={
                        <RequireAuth role="warung_owner" allowPending>
                          <PartnerPending />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/mitra"
                      element={
                        <RequireAuth role="warung_owner">
                          <PartnerLayout />
                        </RequireAuth>
                      }
                    >
                      <Route index element={<PartnerDashboard />} />
                      <Route path="pesanan" element={<PartnerOrders />} />
                      <Route path="menu" element={<PartnerMenus />} />
                      <Route path="dompet" element={<PartnerWallet />} />
                      <Route path="warung" element={<PartnerWarung />} />
                    </Route>

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

                    {/* Rute Standalone / Transaksional (dilindungi RequireAuth) */}
                    <Route
                      path="/warung/:warungId/menu/:menuId"
                      element={
                        <RequireAuth>
                          <MenuDetail />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/warung/:warungId/profil"
                      element={
                        <RequireAuth>
                          <WarungProfile />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <RequireAuth>
                          <Checkout />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/payment/qris"
                      element={
                        <RequireAuth>
                          <PaymentQris />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/checkout/success"
                      element={
                        <RequireAuth>
                          <CheckoutSuccess />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/status/:orderId"
                      element={
                        <RequireAuth>
                          <Receipt />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/review/:orderId"
                      element={
                        <RequireAuth>
                          <Review />
                        </RequireAuth>
                      }
                    />

                    {/* Fallback: belum login arahkan ke login, sudah login arahkan ke beranda */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={isAuthenticated() ? getDefaultHomeForUser() : "/login"}
                          replace
                        />
                      }
                    />
                  </Routes>
                </AppSplashWrapper>
              </BrowserRouter>
            </VoucherProvider>
          </UserProvider>
          </NotificationProvider>
        </OrderProvider>
      </CartProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
