import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/Home";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { APP_CONFIG } from "./config";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/layout/Header";
import Skeleton from "./components/Skeleton";

const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const StaticInfoPage = lazy(() => import("./pages/StaticInfoPage"));

function RouteTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    const titleMap = {
      "/": "Home",
      "/products": "Products",
      "/wishlist": "Wishlist",
      "/login": "Login",
      "/register": "Register",
      "/account": "My Account",
      "/orders": "Order History",
      "/shipping": "Shipping & Returns",
      "/faq": "FAQ",
      "/size-guide": "Size Guide",
      "/care-instructions": "Care Instructions",
      "/about": "About",
      "/privacy": "Privacy Policy",
      "/terms": "Terms & Conditions",
      "/contact": "Contact",
    };

    let pageTitle = titleMap[pathname] || "Store";
    if (pathname.startsWith("/product/")) pageTitle = "Product";
    if (pathname.startsWith("/orders/")) pageTitle = "Order Detail";

    document.title = `${pageTitle} | ${APP_CONFIG.name}`;
  }, [location.pathname]);

  return null;
}

function RouteSkeleton() {
  return (
    <div className="skeleton-page" style={{ paddingTop: "90px" }}>
      <div className="skeleton-header-row">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-chip" />
      </div>
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ErrorBoundary>
            <Router>
              <RouteTitleManager />
              <div className="app">
                <Header />
                <Suspense fallback={<RouteSkeleton />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:handle" element={<ProductPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:orderId" element={<OrderDetail />} />

                    <Route
                      path="/shipping"
                      element={
                        <StaticInfoPage
                          title="Shipping & Returns"
                          description="We process orders quickly and share updates as your parcel moves through packing and dispatch."
                          points={[
                            "Orders are typically processed within 1-3 business days.",
                            "Delivery timelines vary by city and courier coverage.",
                            "Returns and exchanges are accepted for eligible items only.",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/faq"
                      element={
                        <StaticInfoPage
                          title="Frequently Asked Questions"
                          description="Quick answers to the most common questions from our customers."
                          points={[
                            "How can I track my order? Use your order details and tracking updates sent by email.",
                            "Can I exchange an item? Yes, eligible items can be exchanged within policy timelines.",
                            "Need support? Reach out via our contact details in the footer.",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/size-guide"
                      element={
                        <StaticInfoPage
                          title="Size Guide"
                          description="Use this guide to choose the best fit for your style and comfort."
                          points={[
                            "Review product descriptions for size notes.",
                            "Compare your measurements with the recommended fit.",
                            "Contact support if you need sizing help before ordering.",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/care-instructions"
                      element={
                        <StaticInfoPage
                          title="Care Instructions"
                          description="Follow these care practices to maintain fabric quality and color."
                          points={[
                            "Prefer gentle wash cycles and mild detergents.",
                            "Avoid direct high heat when ironing delicate fabrics.",
                            "Store garments in a cool, dry space.",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <StaticInfoPage
                          title="Our Story"
                          description="Libaayah blends timeless eastern aesthetics with modern wearability."
                        />
                      }
                    />
                    <Route
                      path="/privacy"
                      element={
                        <StaticInfoPage
                          title="Privacy Policy"
                          description="We respect your privacy and handle your data with care and transparency."
                        />
                      }
                    />
                    <Route
                      path="/terms"
                      element={
                        <StaticInfoPage
                          title="Terms & Conditions"
                          description="These terms define website usage, order processing, and user responsibilities."
                        />
                      }
                    />
                    <Route
                      path="/contact"
                      element={
                        <StaticInfoPage
                          title="Contact"
                          description="Need assistance? Our support team is available to help with your orders and product questions."
                        />
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </ErrorBoundary>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
