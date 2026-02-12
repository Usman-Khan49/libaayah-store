// App Configuration
export const APP_CONFIG = {
  name: "Libaayah Store",
  currency: "PKR",
  locale: "en-PK",
};

// API Configuration
export const API_CONFIG = {
  shopifyStorefrontUrl: import.meta.env.VITE_SHOPIFY_STOREFRONT_URL,
  shopifyStorefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  // In production, uses same domain (Vercel serverless function at /api)
  // In dev, uses local Express server
  serverUrl:
    import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.PROD ? "" : "http://localhost:3001"),
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
  LOGIN: "/login",
  REGISTER: "/register",
  SEARCH: "/search",
};

// Cart Configuration
export const CART_CONFIG = {
  maxQuantity: 10,
  persistenceKey: "shopify_cart_id",
};
