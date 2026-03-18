import { useState, useEffect } from "react";
import { getAllProducts } from "../lib/shopify";
import ProductCard from "../components/product/ProductCard";
import Skeleton from "../components/Skeleton";
import { Footer } from "../components/layout";
import "../styles/pages/ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [pageView, setPageView] = useState("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [pageViewOpen, setPageViewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states (UI only for now)
  const [filters, setFilters] = useState({
    availability: {
      inStock: false,
      outOfStock: false,
    },
    salePercentage: {
      "25": false,
      "30": false,
      "50": false,
    },
    priceRange: [0, 10000], // Default max price, will be calculated from products
    fabricType: {
      cotton: false,
      silk: false,
      linen: false,
      chiffon: false,
      velvet: false,
    },
    color: {
      black: false,
      white: false,
      red: false,
      blue: false,
      green: false,
      beige: false,
    },
  });

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

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (category, key) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange:
        type === "min"
          ? [parseInt(value), prev.priceRange[1]]
          : [prev.priceRange[0], parseInt(value)],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      availability: {
        inStock: false,
        outOfStock: false,
      },
      salePercentage: {
        "25": false,
        "30": false,
        "50": false,
      },
      priceRange: [0, 10000],
      fabricType: {
        cotton: false,
        silk: false,
        linen: false,
        chiffon: false,
        velvet: false,
      },
      color: {
        black: false,
        white: false,
        red: false,
        blue: false,
        green: false,
        beige: false,
      },
    });
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="skeleton-page" style={{ marginTop: "120px" }}>
          <div className="skeleton-header-row">
            <Skeleton className="skeleton-title" />
            <Skeleton className="skeleton-chip" />
          </div>
          <div className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
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
          <button className="toolbar-btn filter-btn" onClick={toggleFilter}>
            <span className="filter-icon">☰</span> Filter
          </button>
        </div>

        <div className="toolbar-center">
          <span className="product-count">{products.length} Products</span>
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

      {/* Filter Menu */}
      <div className={`filter-menu ${filterOpen ? "open" : ""}`}>
        <div className="filter-menu-content">
          <div className="filter-menu-heading">Filter Options</div>

          {/* Availability Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Availability</h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.availability.inStock}
                  onChange={() => handleFilterChange("availability", "inStock")}
                />
                <span>In Stock</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.availability.outOfStock}
                  onChange={() =>
                    handleFilterChange("availability", "outOfStock")
                  }
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div>

          {/* Sale Percentage Filter */}
          <div className="filter-section">
            <h3 className="filter-title">By Sale Percentage</h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.salePercentage["25"]}
                  onChange={() => handleFilterChange("salePercentage", "25")}
                />
                <span>25% Off</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.salePercentage["30"]}
                  onChange={() => handleFilterChange("salePercentage", "30")}
                />
                <span>30% Off</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.salePercentage["50"]}
                  onChange={() => handleFilterChange("salePercentage", "50")}
                />
                <span>50% Off</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h3 className="filter-title">By Price</h3>
            <div className="filter-options">
              <div className="price-range-container">
                <div className="dual-slider-wrapper">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                    className="price-slider price-slider-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                    className="price-slider price-slider-max"
                  />
                </div>
                <div className="price-range-labels">
                  <span>Rs. {filters.priceRange[0]}</span>
                  <span>Rs. {filters.priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fabric Type Filter */}
          <div className="filter-section">
            <h3 className="filter-title">By Fabric Type</h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.fabricType.cotton}
                  onChange={() => handleFilterChange("fabricType", "cotton")}
                />
                <span>Cotton</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.fabricType.silk}
                  onChange={() => handleFilterChange("fabricType", "silk")}
                />
                <span>Silk</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.fabricType.linen}
                  onChange={() => handleFilterChange("fabricType", "linen")}
                />
                <span>Linen</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.fabricType.chiffon}
                  onChange={() => handleFilterChange("fabricType", "chiffon")}
                />
                <span>Chiffon</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.fabricType.velvet}
                  onChange={() => handleFilterChange("fabricType", "velvet")}
                />
                <span>Velvet</span>
              </label>
            </div>
          </div>

          {/* Color Filter */}
          <div className="filter-section">
            <h3 className="filter-title">By Color</h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.black}
                  onChange={() => handleFilterChange("color", "black")}
                />
                <span>Black</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.white}
                  onChange={() => handleFilterChange("color", "white")}
                />
                <span>White</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.red}
                  onChange={() => handleFilterChange("color", "red")}
                />
                <span>Red</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.blue}
                  onChange={() => handleFilterChange("color", "blue")}
                />
                <span>Blue</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.green}
                  onChange={() => handleFilterChange("color", "green")}
                />
                <span>Green</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.color.beige}
                  onChange={() => handleFilterChange("color", "beige")}
                />
                <span>Beige</span>
              </label>
            </div>
          </div>

          {/* Clear All Button */}
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Filter Overlay */}
      {filterOpen && (
        <div className="filter-overlay" onClick={toggleFilter}></div>
      )}

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
