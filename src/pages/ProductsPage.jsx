import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  getProductsWithFilters,
  getCollectionByHandle,
  getCollectionProductsWithFilters,
  buildCollectionSearchQueries,
} from "../lib/shopify";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductsPage.css";

const parseFilterInput = (input) => {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

const getPriceBoundsFromValues = (values) => {
  let min = null;
  let max = null;

  values.forEach((val) => {
    const parsed = parseFilterInput(val.input);
    const price = parsed?.price;
    if (!price) return;

    const parsedMin = Number(price.min);
    const parsedMax = Number(price.max);

    if (Number.isFinite(parsedMin)) {
      min = min === null ? parsedMin : Math.min(min, parsedMin);
    }
    if (Number.isFinite(parsedMax)) {
      max = max === null ? parsedMax : Math.max(max, parsedMax);
    }
  });

  return { min, max };
};

const getPriceBoundsFromProducts = (products) => {
  let min = null;
  let max = null;

  products.forEach((product) => {
    const priceValue = parseFloat(
      product?.variants?.edges?.[0]?.node?.price?.amount,
    );
    if (!Number.isFinite(priceValue)) return;

    min = min === null ? priceValue : Math.min(min, priceValue);
    max = max === null ? priceValue : Math.max(max, priceValue);
  });

  return { min, max };
};

const toTitleCase = (value) =>
  value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeValue = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function ProductsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionParam = searchParams.get("collection");
  const categoryParam = searchParams.get("category");
  const saleParam = searchParams.get("sale");
  const sortParam = searchParams.get("sort");
  const fabricParam = searchParams.get("fabric");

  const activeCollectionHandle =
    collectionParam || categoryParam || (saleParam === "true" ? "sale" : null);
  const searchQuery = useMemo(
    () =>
      activeCollectionHandle
        ? buildCollectionSearchQueries(activeCollectionHandle)
        : "*",
    [activeCollectionHandle],
  );

  const [collectionTitle, setCollectionTitle] = useState("All Products");
  const [products, setProducts] = useState([]);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: null, max: null });
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("RELEVANCE");
  const [reverseSort, setReverseSort] = useState(false);
  const [sortLabel, setSortLabel] = useState("Featured");

  const [pageView] = useState("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let productData = [];
        let dynamicFilters = [];
        let collectionId = null;

        if (activeCollectionHandle) {
          const collectionResult = await getCollectionProductsWithFilters(
            activeCollectionHandle,
            47,
            activeFilters,
            sortKey,
            reverseSort,
          );

          productData = collectionResult.products;
          dynamicFilters = collectionResult.filters;
          collectionId = collectionResult.collection?.id || null;

          if (productData.length === 0 && dynamicFilters.length === 0) {
            const fallbackQueries = buildCollectionSearchQueries(
              activeCollectionHandle,
              collectionId,
            );
            const fallbackResult = await getProductsWithFilters(
              47,
              activeFilters,
              sortKey,
              reverseSort,
              fallbackQueries,
            );
            productData = fallbackResult.products;
            dynamicFilters = fallbackResult.filters;
          }
        } else {
          const fallbackResult = await getProductsWithFilters(
            47,
            activeFilters,
            sortKey,
            reverseSort,
            searchQuery,
          );
          productData = fallbackResult.products;
          dynamicFilters = fallbackResult.filters;
        }

        setProducts(productData);
        setAvailableFilters(dynamicFilters);

        const hasPriceFilter = activeFilters.some((filter) => filter.price);
        if (!hasPriceFilter) {
          const priceGroup = dynamicFilters.find(
            (filter) => filter.type === "PRICE_RANGE",
          );
          const boundsFromValues = getPriceBoundsFromValues(
            priceGroup?.values || [],
          );
          const boundsFromProducts = getPriceBoundsFromProducts(productData);

          let nextMin = boundsFromValues.min ?? boundsFromProducts.min ?? null;
          let nextMax = boundsFromValues.max ?? boundsFromProducts.max ?? null;

          if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
            nextMax = nextMin;
          }

          if (nextMin !== null || nextMax !== null) {
            setPriceBounds({ min: nextMin, max: nextMax });
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    activeFilters,
    sortKey,
    reverseSort,
    searchQuery,
    activeCollectionHandle,
  ]);

  useEffect(() => {
    let cancelled = false;

    const fetchCollectionTitle = async () => {
      if (!activeCollectionHandle) {
        setCollectionTitle("All Products");
        return;
      }

      try {
        const collection = await getCollectionByHandle(activeCollectionHandle);
        if (!cancelled) {
          setCollectionTitle(
            collection?.title || toTitleCase(activeCollectionHandle),
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching collection title:", error);
          setCollectionTitle(toTitleCase(activeCollectionHandle));
        }
      }
    };

    fetchCollectionTitle();

    return () => {
      cancelled = true;
    };
  }, [activeCollectionHandle]);

  useEffect(() => {
    if (!sortParam) return;

    switch (sortParam) {
      case "new":
      case "newest":
        setSortKey("CREATED_AT");
        setReverseSort(true);
        setSortLabel("Newest");
        break;
      case "price-low":
        setSortKey("PRICE");
        setReverseSort(false);
        setSortLabel("Price: Low to High");
        break;
      case "price-high":
        setSortKey("PRICE");
        setReverseSort(true);
        setSortLabel("Price: High to Low");
        break;
      case "featured":
      default:
        setSortKey("RELEVANCE");
        setReverseSort(false);
        setSortLabel("Featured");
        break;
    }
  }, [sortParam]);

  useEffect(() => {
    setActiveFilters([]);
  }, [activeCollectionHandle]);

  useEffect(() => {
    if (!availableFilters.length) return;

    const fabricGroup = availableFilters.find(
      (filter) =>
        normalizeValue(filter.label)?.includes("fabric") ||
        filter.values?.some((value) => {
          const parsed = parseFilterInput(value.input);
          return parsed?.productMetafield?.key === "fabric";
        }),
    );

    if (!fabricGroup || !fabricGroup.values?.length) return;

    const fabricInputs = fabricGroup.values
      .map((value) => parseFilterInput(value.input))
      .filter(Boolean)
      .map((value) => JSON.stringify(value));
    const fabricInputSet = new Set(fabricInputs);

    if (!fabricParam) {
      setActiveFilters((prev) =>
        prev.filter((filter) => !fabricInputSet.has(JSON.stringify(filter))),
      );
      return;
    }

    const normalizedParam = normalizeValue(fabricParam);
    const matchedValue = fabricGroup.values.find(
      (value) => normalizeValue(value.label) === normalizedParam,
    );
    const parsedInput = matchedValue
      ? parseFilterInput(matchedValue.input)
      : null;

    if (!parsedInput) return;

    const targetString = JSON.stringify(parsedInput);

    setActiveFilters((prev) => {
      const withoutFabric = prev.filter(
        (filter) => !fabricInputSet.has(JSON.stringify(filter)),
      );
      const next = withoutFabric.some(
        (filter) => JSON.stringify(filter) === targetString,
      )
        ? withoutFabric
        : [...withoutFabric, parsedInput];

      const prevKey = prev
        .map((filter) => JSON.stringify(filter))
        .sort()
        .join("|");
      const nextKey = next
        .map((filter) => JSON.stringify(filter))
        .sort()
        .join("|");

      return prevKey === nextKey ? prev : next;
    });
  }, [availableFilters, fabricParam]);

  const handleSortChange = (key, reverse, label) => {
    setSortKey(key);
    setReverseSort(reverse);
    setSortLabel(label);
    setSortOpen(false);
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterToggle = (parsedInput) => {
    if (!parsedInput) return;

    const inputString = JSON.stringify(parsedInput);
    setActiveFilters((prev) => {
      const existsIndex = prev.findIndex(
        (filter) => JSON.stringify(filter) === inputString,
      );
      if (existsIndex >= 0) {
        return [...prev.slice(0, existsIndex), ...prev.slice(existsIndex + 1)];
      }
      return [...prev, parsedInput];
    });
  };

  const handlePriceRangeChange = (min, max) => {
    const nextMin = min === "" ? null : parseFloat(min);
    const nextMax = max === "" ? null : parseFloat(max);

    const sanitizedMin = Number.isFinite(nextMin) ? nextMin : null;
    const sanitizedMax = Number.isFinite(nextMax) ? nextMax : null;

    let normalizedMin = sanitizedMin;
    let normalizedMax = sanitizedMax;

    if (
      normalizedMin !== null &&
      normalizedMax !== null &&
      normalizedMin > normalizedMax
    ) {
      normalizedMax = normalizedMin;
    }

    setActiveFilters((prev) => {
      const withoutPrice = prev.filter((filter) => !filter.price);

      if (normalizedMin === null && normalizedMax === null) {
        return withoutPrice;
      }

      const priceFilter = { price: {} };
      if (normalizedMin !== null) priceFilter.price.min = normalizedMin;
      if (normalizedMax !== null) priceFilter.price.max = normalizedMax;

      return [...withoutPrice, priceFilter];
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="products-page">
      {/* Collection Header */}
      <section className="collection-header">
        <h1 className="collection-title">{collectionTitle}</h1>
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
              {sortLabel}
              <span className={`chevron ${sortOpen ? "open" : ""}`}>▾</span>
            </button>
            {sortOpen && (
              <div className="dropdown-menu sort-menu">
                <button
                  className="dropdown-item"
                  onClick={() =>
                    handleSortChange("RELEVANCE", false, "Featured")
                  }
                >
                  Featured
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleSortChange("CREATED_AT", true, "Newest")}
                >
                  Newest
                </button>
                <button
                  className="dropdown-item"
                  onClick={() =>
                    handleSortChange("PRICE", false, "Price: Low to High")
                  }
                >
                  Price: Low to High
                </button>
                <button
                  className="dropdown-item"
                  onClick={() =>
                    handleSortChange("PRICE", true, "Price: High to Low")
                  }
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

          {availableFilters.map((filterGroup) => {
            const values = filterGroup.values || [];

            if (filterGroup.type === "PRICE_RANGE") {
              const boundsFromValues = getPriceBoundsFromValues(values);
              const boundsFromProducts = getPriceBoundsFromProducts(products);

              const minBound =
                priceBounds.min ??
                boundsFromValues.min ??
                boundsFromProducts.min ??
                0;
              const maxBound =
                priceBounds.max ??
                boundsFromValues.max ??
                boundsFromProducts.max ??
                minBound ??
                0;

              const activePriceFilter = activeFilters.find(
                (filter) => filter.price,
              );

              const currentMin = activePriceFilter?.price?.min ?? minBound ?? 0;
              const currentMax = activePriceFilter?.price?.max ?? maxBound ?? 0;

              const clampedMin = Math.min(
                Math.max(currentMin, minBound),
                maxBound,
              );
              const clampedMax = Math.min(
                Math.max(currentMax, minBound),
                maxBound,
              );

              return (
                <div key={filterGroup.id} className="filter-section">
                  <h3 className="filter-title">{filterGroup.label}</h3>
                  <div className="filter-options">
                    <div className="price-range-container">
                      <div className="dual-slider-wrapper">
                        <input
                          type="range"
                          min={minBound}
                          max={maxBound}
                          value={clampedMin}
                          onChange={(e) =>
                            handlePriceRangeChange(e.target.value, clampedMax)
                          }
                          className="price-slider price-slider-min"
                        />
                        <input
                          type="range"
                          min={minBound}
                          max={maxBound}
                          value={clampedMax}
                          onChange={(e) =>
                            handlePriceRangeChange(clampedMin, e.target.value)
                          }
                          className="price-slider price-slider-max"
                        />
                      </div>
                      <div className="price-range-labels">
                        <span>Rs. {clampedMin}</span>
                        <span>Rs. {clampedMax}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={filterGroup.id} className="filter-section">
                <h3 className="filter-title">{filterGroup.label}</h3>
                <div className="filter-options">
                  {values.length > 0 ? (
                    values.map((val) => {
                      const parsedInput = parseFilterInput(val.input);
                      if (!parsedInput) return null;

                      const inputString = JSON.stringify(parsedInput);
                      const isActive = activeFilters.some(
                        (filter) => JSON.stringify(filter) === inputString,
                      );

                      return (
                        <label key={val.id} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleFilterToggle(parsedInput)}
                          />
                          <span>
                            {val.label} ({val.count})
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <span>No options available.</span>
                  )}
                </div>
              </div>
            );
          })}

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
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-products-found">
            <p>No products match your current filters.</p>
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
