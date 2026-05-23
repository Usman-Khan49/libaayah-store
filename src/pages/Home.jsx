import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCollectionProductsWithFilters,
  getCollections,
} from "../lib/shopify";
import { Footer } from "../components/layout";
import ReelsSection from "../components/layout/ReelsSection";
import ProductCard from "../components/product/ProductCard";
import ProductsCarousel from "../components/layout/ProductsCarousel";
import UtilitiesSection from "../components/layout/UtilitiesSection";
import showcaseVideo from "../assets/Bottom_Banner.mp4";
import unstitchedImg from "../assets/img36.jpg";
import winterImg from "../assets/img88.jpg";
import summerImg from "../assets/img109.jpg";
import "../styles/pages/HomePage.css";

const popularCollections = [
  {
    key: "winter",
    label: "Winter",
  },
  {
    key: "summer",
    label: "Summer",
  },
];

const shopCategories = [
  {
    key: "unstitched",
    label: "Unstitched",
    image: unstitchedImg,
    alt: "Unstitched Collection",
  },
  {
    key: "winter",
    label: "Winter",
    image: winterImg,
    alt: "Winter Collection",
  },
  {
    key: "summer",
    label: "Summer",
    image: summerImg,
    alt: "Summer Collection",
  },
];

const normalizeValue = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findCollectionMatch = (label, collections) => {
  const normalizedLabel = normalizeValue(label);
  return (
    collections.find(
      (collection) => normalizeValue(collection.title) === normalizedLabel,
    ) ||
    collections.find(
      (collection) => normalizeValue(collection.handle) === normalizedLabel,
    ) ||
    collections.find((collection) =>
      normalizeValue(collection.title).includes(normalizedLabel),
    ) ||
    collections.find((collection) =>
      normalizeValue(collection.handle).includes(normalizedLabel),
    ) ||
    null
  );
};

export default function HomePage() {
  const [collectionProducts, setCollectionProducts] = useState({});
  const [collectionMap, setCollectionMap] = useState({});
  const [activeCategory, setActiveCategory] = useState(
    popularCollections[0]?.key || "winter",
  );
  const [animKey, setAnimKey] = useState(0);

  const resolvedPopularCollections = useMemo(
    () =>
      popularCollections.map((collection) => {
        const match = collectionMap[collection.key];
        return {
          ...collection,
          handle: match?.handle || null,
          link: match?.handle
            ? `/products?collection=${match.handle}`
            : "/products",
        };
      }),
    [collectionMap],
  );

  const resolvedShopCategories = useMemo(
    () =>
      shopCategories.map((category) => {
        if (category.key === "unstitched") {
          return { ...category, link: "/products" };
        }

        const match = collectionMap[category.key];
        return {
          ...category,
          link: match?.handle
            ? `/products?collection=${match.handle}`
            : "/products",
        };
      }),
    [collectionMap],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCollections = async () => {
      try {
        const data = await getCollections(20);
        const nextMap = popularCollections.reduce((acc, collection) => {
          const match = findCollectionMatch(collection.label, data);
          if (match) acc[collection.key] = match;
          return acc;
        }, {});

        if (!cancelled) {
          setCollectionMap(nextMap);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching collections:", error);
        }
      }
    };

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchCollections = async () => {
      try {
        const entries = await Promise.all(
          resolvedPopularCollections.map(async (collection) => {
            if (!collection.handle) {
              return [collection.key, []];
            }

            const result = await getCollectionProductsWithFilters(
              collection.handle,
              16,
            );
            return [collection.key, result.products || []];
          }),
        );

        if (!cancelled) {
          setCollectionProducts(Object.fromEntries(entries));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching collection products:", error);
        }
      }
    };

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, [resolvedPopularCollections]);

  const handleCategoryChange = (key) => {
    if (key !== activeCategory) {
      setActiveCategory(key);
      setAnimKey((prev) => prev + 1);
    }
  };

  const filteredProducts = (collectionProducts[activeCategory] || []).slice(
    0,
    8,
  );
  const activeCategoryData = resolvedPopularCollections.find(
    (c) => c.key === activeCategory,
  );

  return (
    <div className="homepage-container">
      {/* Hero Placeholder */}
      <section className="hero-placeholder">
        {/* Placeholder for future hero banner */}
      </section>

      {/* Collection Tabs Section */}
      <section className="collection-tabs-section">
        <h2 className="collection-tabs-heading">
          Discover Our Most Popular Picks
        </h2>

        {/* Category Tabs */}
        <div className="collection-tabs">
          {resolvedPopularCollections.map((cat) => (
            <button
              key={cat.key}
              className={`collection-tab ${activeCategory === cat.key ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label}
              {activeCategory === cat.key && (
                <span key={animKey} className="tab-underline" />
              )}
            </button>
          ))}
        </div>

        {/* Products Carousel */}
        <ProductsCarousel key={activeCategory} products={filteredProducts} />

        {/* View All Button */}
        <div className="collection-view-all">
          <Link
            to={activeCategoryData?.link || "/products"}
            className="view-all-btn"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Category Bento Grid */}
      <section className="home-section">
        <h2 className="home-section-heading">Shop by Category</h2>
        <p className="home-section-subheading">Find your perfect piece</p>
        <div className="hero-categories">
          {resolvedShopCategories.map((category) => (
            <Link
              key={category.key}
              to={category.link}
              className="category-box"
            >
              <img
                src={category.image}
                alt={category.alt}
                className="category-image"
                loading="lazy"
                decoding="async"
              />
              <div className="category-overlay">
                <h2 className="category-title">{category.label}</h2>
                <p className="category-shop-now">Shop Now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Showcase Video + CTA Section */}
      <section className="showcase-section">
        <div className="showcase-video-wrapper">
          <video
            className="showcase-video"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
          >
            <source src={showcaseVideo} type="video/mp4" />
          </video>
        </div>
        <div className="showcase-text">
          <h2 className="showcase-heading">Crafted with Passion</h2>
          <p className="showcase-description">
            Every piece in our collection tells a story of tradition, elegance,
            and meticulous craftsmanship. Discover fabrics that drape
            beautifully and designs that turn heads.
          </p>
          <Link to="/products" className="showcase-cta">
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* Reels Section */}
      <section className="home-section reels-home-section">
        <h2 className="home-section-heading">#libaayah - Watch And Buy</h2>
        <ReelsSection />
      </section>

      {/* Utilities Module */}
      <UtilitiesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
