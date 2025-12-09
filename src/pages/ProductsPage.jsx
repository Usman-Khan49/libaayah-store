import { useState, useEffect } from "react";
import { getAllProducts } from "../lib/shopify";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productData = await getAllProducts(47);
        setProducts(productData);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      {/* Page Title */}
      <div className="page-title-section">
        <h1 className="page-title">NEW IN</h1>
      </div>

      {/* Filters and Controls */}
      <div className="controls-bar">
        <div className="left-controls">
          <button
            className="control-btn"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            FILTERS <span className="arrow">{filtersOpen ? "▲" : "▼"}</span>
          </button>
          <button className="control-btn">
            SORT BY <span className="arrow">▼</span>
          </button>
        </div>

        <div className="center-info">
          <span className="product-count">{products.length} Products</span>
        </div>

        <div className="right-controls">
          <button className="control-btn">
            PAGE VIEW <span className="arrow">▼</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
