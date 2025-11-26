# Frontend Folder Structure

## 📁 Directory Organization

```
src/
├── components/           # Reusable UI components
│   ├── cart/            # Shopping cart related components
│   │   ├── CartIcon.jsx
│   │   ├── CartDrawer.jsx
│   │   └── CartItem.jsx
│   ├── product/         # Product display components
│   │   ├── ProductCard.jsx
│   │   └── ProductGrid.jsx
│   └── layout/          # Layout components (Header, Footer, etc.)
│       └── Header.jsx
│
├── pages/               # Page-level components (routes)
│   ├── Home.jsx
│   ├── ProductsPage.jsx
│   ├── ProductPage.jsx
│   ├── OrderHistory.jsx
│   └── OrderDetail.jsx
│
├── styles/              # CSS stylesheets
│   ├── components/      # Component-specific styles
│   │   ├── CartIcon.css
│   │   ├── CartDrawer.css
│   │   ├── CartItem.css
│   │   ├── ProductCard.css
│   │   ├── ProductGrid.css
│   │   └── Header.css
│   ├── pages/          # Page-specific styles
│   │   ├── ProductPage.css
│   │   ├── OrderHistory.css
│   │   └── OrderDetail.css
│   └── App.css         # Global app styles
│
├── context/             # React Context providers
│   ├── CartContext.jsx  # Cart state management
│   └── cartContext.js   # Context export
│
├── hooks/               # Custom React hooks
│   └── useCart.js       # Hook for cart operations
│
├── lib/                 # External service integrations
│   ├── firebase.js      # Firebase configuration
│   ├── shopify.js       # Shopify Storefront API
│   └── shopifyCart.js   # Shopify Cart API
│
├── utils/               # Utility functions
│   ├── formatters.js    # Date, price, text formatters
│   ├── validators.js    # Form validation helpers
│   └── index.js         # Utilities barrel export
│
├── config/              # App configuration
│   └── index.js         # Centralized config (routes, API URLs, etc.)
│
├── assets/              # Static assets (images, icons)
│   └── react.svg
│
├── App.jsx              # Root component
├── main.jsx             # App entry point
└── index.css            # Global styles

```

## 🎯 Import Conventions

### Component Imports

```javascript
// Use barrel exports for cleaner imports
import { CartIcon, CartDrawer } from "@/components/cart";
import { ProductCard, ProductGrid } from "@/components/product";
import { Header } from "@/components/layout";
```

### Page Imports

```javascript
import HomePage from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
```

### Utility Imports

```javascript
import { formatPrice, formatDate } from "@/utils";
import { isValidEmail } from "@/utils/validators";
```

### Config Imports

```javascript
import { APP_CONFIG, API_CONFIG, ROUTES } from "@/config";
```

### Style Imports

```javascript
// Import styles relative to component
import "../../styles/components/Header.css";
import "../styles/pages/ProductPage.css";
```

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCart.js`)
- **Utils**: camelCase (e.g., `formatters.js`)
- **CSS files**: Match component name (e.g., `ProductCard.css`)
- **Constants**: UPPER_SNAKE_CASE in config files

## 🔧 Best Practices

1. **Co-location**: Keep related files together (e.g., all cart components in `components/cart/`)
2. **Separation of Concerns**:
   - Components = UI logic
   - Hooks = Reusable state logic
   - Utils = Pure functions
   - Lib = External integrations
3. **Barrel Exports**: Use `index.js` files for cleaner imports
4. **CSS Organization**: Keep styles in `styles/` folder, organized by type
5. **Configuration**: Centralize config values in `config/` folder

## 🚀 Future Additions

When adding new features:

- **New Component Category**: Create folder in `components/` with `index.js`
- **New Page**: Add to `pages/` and update routes in `App.jsx`
- **New API Integration**: Add to `lib/` folder
- **Global Styles**: Add to `styles/` root or create theme file
- **Shared Constants**: Add to `config/index.js`
