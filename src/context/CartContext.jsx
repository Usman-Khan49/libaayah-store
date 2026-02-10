/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useRef } from "react";
import {
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  getCart,
} from "../lib/shopifyCart";

// Create Cart Context
export const CartContext = createContext(null);

const CART_ID_KEY = "shopify_cart_id";

// Cart Provider Component
export const CartProvider = ({ children }) => {
  // State
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce timer refs for quantity updates
  const updateTimers = useRef({});
  const pendingUpdates = useRef({});

  // Load cart from Shopify
  const loadCart = useCallback(async (id) => {
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
      if (err.message?.includes("not found") || !err.message) {
        setCartId(null);
        setCart(null);
        localStorage.removeItem(CART_ID_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart ID from localStorage on mount
  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_ID_KEY);
    if (storedCartId) {
      setCartId(storedCartId);
      loadCart(storedCartId);
    }
  }, [loadCart]);

  // Save cart ID to localStorage
  const saveCartId = (id) => {
    setCartId(id);
    localStorage.setItem(CART_ID_KEY, id);
  };

  // Add item to cart
  const addItem = async (merchandiseId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      const lines = [{ merchandiseId, quantity }];

      if (cartId) {
        const updatedCart = await addToCart(cartId, lines);
        setCart(updatedCart);
      } else {
        const newCart = await createCart(lines);
        setCart(newCart);
        saveCartId(newCart.id);
      }
    } catch (err) {
      console.error("Error adding item to cart:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart line quantity with optimistic updates and debouncing
  const updateItem = async (lineId, quantity) => {
    if (!cartId || !cart) return;

    // Clear existing timer for this line
    if (updateTimers.current[lineId]) {
      clearTimeout(updateTimers.current[lineId]);
    }

    // Optimistic update - update UI immediately
    setCart((prevCart) => {
      if (!prevCart) return prevCart;

      const updatedLines = prevCart.lines.edges.map((edge) => {
        if (edge.node.id === lineId) {
          return {
            ...edge,
            node: {
              ...edge.node,
              quantity: quantity,
            },
          };
        }
        return edge;
      });

      return {
        ...prevCart,
        lines: {
          ...prevCart.lines,
          edges: updatedLines,
        },
      };
    });

    // Store pending update
    pendingUpdates.current[lineId] = quantity;

    // Debounce the actual API call
    updateTimers.current[lineId] = setTimeout(async () => {
      try {
        setError(null);

        const finalQuantity = pendingUpdates.current[lineId];

        if (finalQuantity <= 0) {
          await removeItem([lineId]);
        } else {
          const updatedCart = await updateCartLine(
            cartId,
            lineId,
            finalQuantity,
          );
          setCart(updatedCart);
        }

        delete pendingUpdates.current[lineId];
        delete updateTimers.current[lineId];
      } catch (err) {
        console.error("Error updating cart item:", err);
        setError(err.message);

        // Revert optimistic update on error - reload cart
        await loadCart(cartId);

        delete pendingUpdates.current[lineId];
        delete updateTimers.current[lineId];
      }
    }, 500);
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

      localStorage.removeItem(CART_ID_KEY);
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

  // Proceed to Shopify checkout
  const checkout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  // Get total item count in cart
  const getCartItemCount = () => {
    if (!cart || !cart.lines) return 0;
    return cart.lines.edges.reduce(
      (total, edge) => total + edge.node.quantity,
      0,
    );
  };

  // Get cart subtotal
  const getCartSubtotal = () => {
    if (!cart || !cart.cost) return { amount: "0", currencyCode: "PKR" };
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
    checkout,
    getCartItemCount,
    getCartSubtotal,
    refreshCart: () => loadCart(cartId),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
