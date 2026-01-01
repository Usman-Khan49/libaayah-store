import { useState, useEffect } from "react";
import { getAllProducts, getSearchProducts } from "../../lib/shopify";
import ProductCard from "./ProductCard";
import "../../styles/components/ProductGrid.css";

export default function ProductGrid({ products: propProducts }) {
  const [products, setProducts] = useState(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // If products are passed as props, use them (for homepage)
  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }

    // Otherwise, fetch all products on initial load (for products page)
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productData = await getAllProducts(20);
        setProducts(productData);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [propProducts]);

  // Handle search with debouncing
  useEffect(() => {
    if (propProducts) return; // Skip search if using prop products

    const wasSearching = isSearching;

    if (!searchQuery.trim()) {
      // If search is cleared, reload all products only if we were searching
      if (wasSearching) {
        setIsSearching(false);
        const fetchProducts = async () => {
          try {
            setLoading(true);
            const productData = await getAllProducts(20);
            setProducts(productData);
            setError(null);
          } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
          } finally {
            setLoading(false);
          }
        };
        fetchProducts();
      }
      return;
    }

    // Debounce search
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        if (!wasSearching) setIsSearching(true);
        const searchResults = await getSearchProducts(20, searchQuery);
        setProducts(searchResults);
        setError(null);
      } catch (err) {
        console.error("Error searching products:", err);
        setError("Failed to search products. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1000); // 1000ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only trigger on searchQuery changes

  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="loading">
          <h2>Loading products...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid-container">
        <div className="error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <header className="grid-header">
        <h1>Our Products</h1>
        <p>Discover our latest collection</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {isSearching && searchQuery && (
          <p className="search-info">Showing results for "{searchQuery}"</p>
        )}
      </header>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <h2>No products found</h2>
          <p>Check back soon for new arrivals!</p>
        </div>
      )}
    </div>
  );
}
