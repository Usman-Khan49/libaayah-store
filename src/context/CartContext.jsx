import { useState, useEffect, useCallback, createContext } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  getCart,
} from "../lib/shopifyCart";

// Create Cart Context
export const CartContext = createContext(null);

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();

  // State
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousAuthState, setPreviousAuthState] = useState(isSignedIn);

  // Load cart from Shopify
  const loadCart = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setLoading(true);
        const cartData = await getCart(id);
        setCart(cartData);
        setError(null);
      } catch (err) {
        console.error("Error loading cart:", err);
        setError(err.message);
        // If cart not found, clear the stored ID
        if (err.message.includes("not found")) {
          setCartId(null);
          setCart(null);
          if (isSignedIn && user) {
            await deleteCartIdFromFirestore(user.id);
          } else {
            localStorage.removeItem("shopify_cart_id");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [isSignedIn, user]
  );

  // Load cart ID from storage on mount
  useEffect(() => {
    const loadCartId = async () => {
      try {
        if (isSignedIn && user) {
          // Authenticated user - load cart ID from Firestore
          console.log("Loading cart for authenticated user:", user.id);
          const storedCartId = await getCartIdFromFirestore(user.id);
          if (storedCartId) {
            console.log("Found cart in Firestore:", storedCartId);
            setCartId(storedCartId);
            await loadCart(storedCartId);
          } else {
            console.log("No cart found in Firestore");
          }
        } else {
          // Guest user - load cart ID from localStorage
          console.log("Loading cart for guest user from localStorage");
          const storedCartId = localStorage.getItem("shopify_cart_id");
          if (storedCartId) {
            console.log("Found cart in localStorage:", storedCartId);
            setCartId(storedCartId);
            await loadCart(storedCartId);
          } else {
            console.log("No cart found in localStorage");
          }
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        setError(err.message);
      }
    };

    loadCartId();
  }, [isSignedIn, user, loadCart]);

  // Handle auth state changes (login/logout)
  useEffect(() => {
    const handleAuthChange = async () => {
      // User just logged in (was guest, now authenticated)
      if (isSignedIn && user && !previousAuthState) {
        console.log("User logged in - migrating cart");
        const guestCartId = localStorage.getItem("shopify_cart_id");
        const firestoreCartId = await getCartIdFromFirestore(user.id);

        if (guestCartId && !firestoreCartId) {
          // Guest had cart, authenticated user doesn't - save guest cart to Firestore
          console.log("Saving guest cart to Firestore");
          await saveCartIdToFirestore(user.id, guestCartId);
          localStorage.removeItem("shopify_cart_id");
          setCartId(guestCartId);
        } else if (
          guestCartId &&
          firestoreCartId &&
          guestCartId !== firestoreCartId
        ) {
          // Both have carts - prioritize authenticated cart
          console.log("User has existing cart - loading authenticated cart");
          setCartId(firestoreCartId);
          await loadCart(firestoreCartId);
          localStorage.removeItem("shopify_cart_id");
        } else if (firestoreCartId) {
          // Load authenticated cart
          console.log("Loading authenticated cart from Firestore");
          setCartId(firestoreCartId);
          await loadCart(firestoreCartId);
          localStorage.removeItem("shopify_cart_id");
        }
        setPreviousAuthState(true);
      }
      // User just logged out (was authenticated, now guest)
      else if (!isSignedIn && previousAuthState) {
        console.log("User logged out - keeping cart in localStorage");
        // Save current cart ID to localStorage before losing auth context
        if (cartId) {
          localStorage.setItem("shopify_cart_id", cartId);
        }
        setPreviousAuthState(false);
        // Don't clear the cart - keep it visible for the guest user
      }
    };

    handleAuthChange();
  }, [isSignedIn, user, previousAuthState, cartId, loadCart]);

  // Save cart ID to appropriate storage
  const saveCartId = async (id) => {
    console.log("saveCartId called:", { id, isSignedIn, userId: user?.id });
    setCartId(id);
    if (isSignedIn && user) {
      console.log("User is signed in, saving to Firestore");
      await saveCartIdToFirestore(user.id, id);
    } else {
      console.log("User is guest, saving to localStorage");
      localStorage.setItem("shopify_cart_id", id);
    }
  };

  // Add item to cart
  const addItem = async (merchandiseId, quantity = 1) => {
    console.log("addItem called:", {
      merchandiseId,
      quantity,
      cartId,
      isSignedIn,
    });
    try {
      setLoading(true);
      setError(null);

      const lines = [{ merchandiseId, quantity }];

      if (cartId) {
        // Add to existing cart
        console.log("Adding to existing cart:", cartId);
        const updatedCart = await addToCart(cartId, lines);
        console.log("Cart updated:", updatedCart);
        setCart(updatedCart);

        // Ensure cart ID is saved in storage (in case it wasn't saved before)
        if (isSignedIn && user) {
          const storedCartId = await getCartIdFromFirestore(user.id);
          if (!storedCartId) {
            console.log("Cart ID not in Firestore, saving now");
            await saveCartIdToFirestore(user.id, cartId);
          }
        }
      } else {
        // Create new cart
        console.log("Creating new cart");
        const newCart = await createCart(lines);
        console.log("New cart created:", newCart);
        setCart(newCart);
        await saveCartId(newCart.id);
      }
      console.log("addItem completed successfully");
    } catch (err) {
      console.error("Error adding item to cart - Full error:", err);
      console.error("Error stack:", err.stack);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart line quantity
  const updateItem = async (lineId, quantity) => {
    if (!cartId) return;

    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeItem([lineId]);
      } else {
        const updatedCart = await updateCartLine(cartId, lineId, quantity);
        setCart(updatedCart);
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove items from cart
  const removeItem = async (lineIds) => {
    if (!cartId) return;

    try {
      setLoading(true);
      setError(null);

      const updatedCart = await removeFromCart(cartId, lineIds);
      setCart(updatedCart);
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove cart ID from storage
      if (isSignedIn && user) {
        await deleteCartIdFromFirestore(user.id);
      } else {
        localStorage.removeItem("shopify_cart_id");
      }

      setCart(null);
      setCartId(null);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get total item count in cart
  const getCartItemCount = () => {
    if (!cart || !cart.lines) return 0;
    return cart.lines.edges.reduce(
      (total, edge) => total + edge.node.quantity,
      0
    );
  };

  // Get cart subtotal
  const getCartSubtotal = () => {
    if (!cart || !cart.cost) return { amount: "0", currencyCode: "USD" };
    return cart.cost.subtotalAmount;
  };

  // Context value
  const value = {
    cart,
    cartId,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getCartItemCount,
    getCartSubtotal,
    refreshCart: () => loadCart(cartId),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ========================================
// Firestore Helper Functions
// ========================================

/**
 * Get cart ID from Firestore for authenticated user
 */
const getCartIdFromFirestore = async (userId) => {
  try {
    console.log("Fetching cart ID from Firestore for user:", userId);
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/cart/get`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      console.log("Cart not found in Firestore (response not ok)");
      return null;
    }

    const data = await response.json();
    console.log("Firestore response:", data);
    return data.cartId || null;
  } catch (error) {
    console.error("Error getting cart ID from Firestore:", error);
    return null;
  }
};

/**
 * Save cart ID to Firestore for authenticated user
 */
const saveCartIdToFirestore = async (userId, cartId) => {
  try {
    console.log("Saving cart ID to Firestore:", { userId, cartId });
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/cart/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, cartId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save cart ID to Firestore");
    }

    console.log("Cart ID saved successfully to Firestore");
    return true;
  } catch (error) {
    console.error("Error saving cart ID to Firestore:", error);
    throw error;
  }
};

/**
 * Delete cart ID from Firestore for authenticated user
 */
const deleteCartIdFromFirestore = async (userId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/cart/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete cart ID from Firestore");
    }

    return true;
  } catch (error) {
    console.error("Error deleting cart ID from Firestore:", error);
    throw error;
  }
};
