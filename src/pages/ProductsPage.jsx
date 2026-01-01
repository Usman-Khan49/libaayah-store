import { useState, useEffect } from "react";
import { getAllProducts } from "../lib/shopify";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [pageView, setPageView] = useState("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [pageViewOpen, setPageViewOpen] = useState(false);

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

  const handleSortChange = (value) => {
    setSortBy(value);
    setSortOpen(false);
  };

  const handlePageViewChange = (value) => {
    setPageView(value);
    setPageViewOpen(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      {/* Collection Header */}
      <section className="collection-header">
        <h1 className="collection-title">Unstitched Winter Collection</h1>
      </section>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn filter-btn">
            <span className="filter-icon">☰</span> Filter
          </button>
        </div>

        <div className="toolbar-center">
          <div className="dropdown-wrapper">
            <button
              className="toolbar-btn view-btn"
              onClick={() => setPageViewOpen(!pageViewOpen)}
            >
              Page View
              <span className={`chevron ${pageViewOpen ? "open" : ""}`}>▾</span>
            </button>
            {pageViewOpen && (
              <div className="dropdown-menu view-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handlePageViewChange("grid")}
                >
                  4 Column
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handlePageViewChange("grid-3")}
                >
                  3 Column
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handlePageViewChange("grid-2")}
                >
                  2 Column
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <div className="dropdown-wrapper">
            <button
              className="toolbar-btn sort-btn"
              onClick={() => setSortOpen(!sortOpen)}
            >
              Sort By
              <span className={`chevron ${sortOpen ? "open" : ""}`}>▾</span>
            </button>
            {sortOpen && (
              <div className="dropdown-menu sort-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("featured")}
                >
                  Featured
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("newest")}
                >
                  Newest
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("price-low")}
                >
                  Price: Low to High
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("price-high")}
                >
                  Price: High to Low
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className={`product-grid product-grid-${pageView}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <Footer />
    </div>
  );
}
