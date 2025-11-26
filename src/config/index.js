// App Configuration
export const APP_CONFIG = {
  name: "Libaayah Store",
  currency: "USD",
  locale: "en-US",
};

// API Configuration
export const API_CONFIG = {
  serverUrl: import.meta.env.VITE_SERVER_URL || "http://localhost:3001",
  shopifyStorefrontUrl: import.meta.env.VITE_SHOPIFY_STOREFRONT_URL,
  shopifyStorefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

// Clerk Configuration
export const CLERK_CONFIG = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
};

// Routes
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/product/:handle",
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders/:orderId",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
  ACCOUNT: "/account",
  SEARCH: "/search",
};

// Cart Configuration
export const CART_CONFIG = {
  maxQuantity: 10,
  persistenceKey: "shopify_cart_id",
};
