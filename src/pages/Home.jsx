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
import bottomBannerImg from "../assets/bottom_banner.png";
import bannerImageOne from "../assets/Banner_image_1.png";
import bannerImageTwo from "../assets/Banner_image_2.png";
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

const heroBanners = [
  {
    src: bannerImageOne,
    alt: "Libaayah banner 1",
  },
  {
    src: bannerImageTwo,
    alt: "Libaayah banner 2",
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
  const [bannerIndex, setBannerIndex] = useState(0);
  const [collectionsError, setCollectionsError] = useState(false);
  const [productsError, setProductsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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
        setCollectionsError(false);
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
          setCollectionsError(true);
        }
      }
    };

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchCollections = async () => {
      try {
        setProductsError(false);
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
          setProductsError(true);
        }
      }
    };

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, [resolvedPopularCollections, retryKey]);

  useEffect(() => {
    if (heroBanners.length < 2) return undefined;

    const intervalId = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCategoryChange = (key) => {
    if (key !== activeCategory) {
      setActiveCategory(key);
      setAnimKey((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  const filteredProducts = (collectionProducts[activeCategory] || []).slice(
    0,
    8,
  );
  const activeCategoryData = resolvedPopularCollections.find(
    (c) => c.key === activeCategory,
  );
  const hasHomeError = collectionsError || productsError;

  return (
    <div className="homepage-container">
      {/* Hero Banner Slider */}
      <section className="hero-slider" aria-label="Hero banners">
        <div
          className="hero-slider-track"
          style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
        >
          {heroBanners.map((banner, index) => (
            <div className="hero-slide" key={banner.src}>
              <img
                src={banner.src}
                alt={banner.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="hero-dots">
          {heroBanners.map((_, index) => (
            <button
              key={`hero-dot-${index}`}
              type="button"
              className={`hero-dot ${bannerIndex === index ? "active" : ""}`}
              onClick={() => setBannerIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={bannerIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      </section>

      {/* Collection Tabs Section */}
      <section className="collection-tabs-section">
        <h2 className="collection-tabs-heading">
          Discover Our Most Popular Picks
        </h2>

        {hasHomeError && (
          <div className="home-error">
            <p>We are having trouble loading this section right now.</p>
            <button className="home-error-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}

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

      {/* Showcase Banner + CTA Section */}
      <section className="showcase-section">
        <div className="showcase-video-wrapper">
          <img
            className="showcase-image"
            src={bottomBannerImg}
            alt="Libaayah showcase banner"
            loading="lazy"
            decoding="async"
          />
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
