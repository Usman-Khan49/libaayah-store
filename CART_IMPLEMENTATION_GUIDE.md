# 🛒 Shopping Cart Implementation Guide - Hybrid Approach

## Overview

We're implementing a hybrid cart system that uses:

- **Shopify Cart API** for cart operations and data
- **Firestore** for authenticated user cart persistence
- **localStorage** for guest user cart persistence
- **React Context** for global state management

---

## 🎯 Implementation Steps

### **Step 1: Add Shopify Cart API Functions**

**File:** `src/utils/shopify.js`

Add these GraphQL-based functions to interact with Shopify's Cart API:

#### Functions to Add:

1. `createCart(lines)` - Create a new cart with initial items
2. `addToCart(cartId, lines)` - Add items to existing cart
3. `updateCartLine(cartId, lineId, quantity)` - Update item quantity
4. `removeFromCart(cartId, lineIds)` - Remove items from cart
5. `getCart(cartId)` - Fetch current cart state

#### GraphQL Mutations:

```graphql
# Create Cart
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      lines(first: 100) { ... }
      cost { ... }
    }
  }
}

# Add to Cart
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { ... }
  }
}

# Update Cart Line
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart { ... }
  }
}

# Remove from Cart
mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart { ... }
  }
}

# Get Cart
query getCart($cartId: ID!) {
  cart(id: $cartId) {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) { ... }
    cost { ... }
  }
}
```

---

### **Step 2: Create Cart Context**

**File:** `src/contexts/CartContext.jsx`

#### Responsibilities:

1. **State Management** - Track cart items, total, quantity
2. **Cart ID Management** - Store/retrieve cart ID
3. **Operations** - Provide functions to add/remove/update items
4. **Persistence** - Sync with localStorage and Firestore

#### Context Structure:

```javascript
const CartContext = createContext({
  cart: null, // Current cart object from Shopify
  loading: false, // Loading state
  error: null, // Error state
  itemCount: 0, // Total items in cart
  addToCart: async (variantId, quantity) => {},
  removeFromCart: async (lineId) => {},
  updateQuantity: async (lineId, quantity) => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});
```

#### Key Logic:

```javascript
// On app load:
useEffect(() => {
  const initCart = async () => {
    // 1. Check if user is logged in (Clerk)
    if (isSignedIn) {
      // Fetch cartId from Firestore
      const userDoc = await getDoc(doc(db, "Users", userId));
      const savedCartId = userDoc.data()?.cartId;

      if (savedCartId) {
        // Load cart from Shopify
        const cart = await getCart(savedCartId);
        if (cart) {
          setCart(cart);
        } else {
          // Cart expired, create new
          const newCart = await createCart([]);
          setCart(newCart);
          // Save to Firestore
          await updateDoc(doc(db, "Users", userId), {
            cartId: newCart.id,
          });
        }
      }
    } else {
      // Guest user - check localStorage
      const localCartId = localStorage.getItem("cartId");
      if (localCartId) {
        const cart = await getCart(localCartId);
        if (cart) {
          setCart(cart);
        }
      }
    }
  };

  initCart();
}, [isSignedIn, userId]);
```

---

### **Step 3: Create Cart Icon Component**

**File:** `src/components/CartIcon.jsx`

#### Features:

- Shopping cart icon (SVG or icon library)
- Badge showing item count
- Click to open cart drawer
- Animated when items are added

#### Example:

```jsx
<button className="cart-icon" onClick={toggleCart}>
  <ShoppingCartIcon />
  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
</button>
```

---

### **Step 4: Create Cart Drawer**

**File:** `src/components/CartDrawer.jsx`

#### Features:

- Slide-in from right
- List all cart items
- Quantity controls (+/-)
- Remove button
- Subtotal display
- Checkout button

#### Structure:

```jsx
<div className={`cart-drawer ${isOpen ? "open" : ""}`}>
  <div className="cart-header">
    <h2>Your Cart ({itemCount} items)</h2>
    <button onClick={closeCart}>×</button>
  </div>

  <div className="cart-items">
    {cart?.lines.edges.map(({ node: item }) => (
      <CartItem key={item.id} item={item} />
    ))}
  </div>

  <div className="cart-footer">
    <div className="cart-total">
      <span>Subtotal:</span>
      <span>${cart?.cost.subtotalAmount.amount}</span>
    </div>
    <button onClick={handleCheckout}>Proceed to Checkout</button>
  </div>
</div>
```

---

### **Step 5: Connect Add to Cart Button**

**File:** `src/pages/ProductPage.jsx`

#### Update the Add to Cart button:

```jsx
import { useCart } from "../contexts/CartContext";

function ProductPage() {
  const { addToCart, loading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      await addToCart(selectedVariant.id, 1);
      // Show success toast/notification
      alert("Added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart");
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || !selectedVariant?.availableForSale}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

---

### **Step 6: Cart Persistence & Sync**

#### For Authenticated Users:

```javascript
// Save cart ID to Firestore whenever cart is created/updated
const syncCartToFirestore = async (cartId, userId) => {
  await updateDoc(doc(db, "Users", userId), {
    cartId: cartId,
    cartUpdatedAt: serverTimestamp(),
  });
};
```

#### For Guest Users:

```javascript
// Save to localStorage
localStorage.setItem("cartId", cartId);
```

#### On User Login (merge carts):

```javascript
const mergeGuestCart = async (userId) => {
  const guestCartId = localStorage.getItem("cartId");

  if (guestCartId) {
    // Get guest cart items
    const guestCart = await getCart(guestCartId);

    // Get user cart from Firestore
    const userDoc = await getDoc(doc(db, "Users", userId));
    const userCartId = userDoc.data()?.cartId;

    if (userCartId && guestCart) {
      // Add guest items to user cart
      const guestItems = guestCart.lines.edges.map((e) => ({
        merchandiseId: e.node.merchandise.id,
        quantity: e.node.quantity,
      }));

      await addToCart(userCartId, guestItems);
    } else if (guestCart) {
      // No user cart, use guest cart
      await updateDoc(doc(db, "Users", userId), {
        cartId: guestCartId,
      });
    }

    // Clear localStorage
    localStorage.removeItem("cartId");
  }
};
```

---

### **Step 7: Checkout Integration**

#### Redirect to Shopify Checkout:

```javascript
const handleCheckout = () => {
  if (cart?.checkoutUrl) {
    // Redirect to Shopify hosted checkout
    window.location.href = cart.checkoutUrl;
  }
};
```

---

## 📁 File Structure

```
src/
├── contexts/
│   └── CartContext.jsx          # Cart state management
├── components/
│   ├── CartIcon.jsx             # Cart icon with badge
│   ├── CartDrawer.jsx           # Cart sidebar/modal
│   ├── CartItem.jsx             # Individual cart item
│   └── CartSummary.jsx          # Cart totals
├── utils/
│   └── shopify.js               # Add cart API functions
└── pages/
    └── ProductPage.jsx          # Wire up Add to Cart button
```

---

## 🔄 Data Flow

```
User clicks "Add to Cart"
    ↓
CartContext.addToCart(variantId, quantity)
    ↓
Check if cart exists
    ├─ Yes → Use existing cartId
    └─ No  → Create new cart
    ↓
Call Shopify API (addToCart or createCart)
    ↓
Update local state (setCart)
    ↓
Persist cartId
    ├─ Authenticated → Save to Firestore
    └─ Guest → Save to localStorage
    ↓
UI updates automatically (Context)
```

---

## 🎨 UI/UX Considerations

1. **Loading States** - Show spinner while adding/updating cart
2. **Success Feedback** - Toast notification on add to cart
3. **Empty State** - "Your cart is empty" message
4. **Animations** - Smooth slide-in for cart drawer
5. **Mobile Responsive** - Full-screen drawer on mobile
6. **Item Images** - Show product thumbnails in cart
7. **Stock Warnings** - "Only X left" messages

---

## 🧪 Testing Checklist

- [ ] Guest user can add items to cart
- [ ] Cart persists on page refresh (localStorage)
- [ ] Logged-in user cart saves to Firestore
- [ ] Cart syncs across devices for logged-in users
- [ ] Guest cart merges with user cart on login
- [ ] Quantity updates work correctly
- [ ] Remove item works correctly
- [ ] Checkout redirect works
- [ ] Expired cart creates new cart
- [ ] Empty cart shows proper message

---

## 🚀 Implementation Order

1. ✅ Add cart functions to `shopify.js`
2. ✅ Create `CartContext.jsx`
3. ✅ Create `CartIcon.jsx`
4. ✅ Create `CartDrawer.jsx` and `CartItem.jsx`
5. ✅ Wire up ProductPage Add to Cart
6. ✅ Implement cart persistence (localStorage + Firestore)
7. ✅ Add checkout redirect
8. ✅ Test and polish

---

## 📚 Resources

- [Shopify Cart API Docs](https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate)
- [React Context Guide](https://react.dev/learn/passing-data-deeply-with-context)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

---

Ready to start with Step 1? Let me know when you want to begin implementing!
