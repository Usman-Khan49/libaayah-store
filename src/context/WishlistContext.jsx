import { createContext, useState, useEffect, useContext } from "react";

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    // Initialize state from localStorage
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        return JSON.parse(savedWishlist);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        return [];
      }
    }
    return [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      // Check if product already exists
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, product];
    });
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlist.length;
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
