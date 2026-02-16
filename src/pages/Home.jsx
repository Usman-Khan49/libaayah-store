import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../lib/shopify";
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

const categories = [
  { key: "unstitched", label: "Unstitched", link: "/products?category=unstitched" },
  { key: "winter", label: "Winter", link: "/products?category=winter" },
  { key: "summer", label: "Summer", link: "/products?category=summer" },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("unstitched");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getAllProducts(16);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (key) => {
    if (key !== activeCategory) {
      setActiveCategory(key);
      setAnimKey((prev) => prev + 1);
    }
  };

  // For now all products are shown (filtering will be implemented later with Shopify tags)
  const filteredProducts = products.slice(0, 8);
  const activeCategoryData = categories.find((c) => c.key === activeCategory);

  return (
    <div className="homepage-container">
      {/* Hero Placeholder */}
      <section className="hero-placeholder">
        {/* Placeholder for future hero banner */}
      </section>

      {/* Collection Tabs Section */}
      <section className="collection-tabs-section">
        <h2 className="collection-tabs-heading">Discover Our Most Popular Picks</h2>

        {/* Category Tabs */}
        <div className="collection-tabs">
          {categories.map((cat) => (
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
        <ProductsCarousel products={filteredProducts} />

        {/* View All Button */}
        <div className="collection-view-all">
          <Link to={activeCategoryData?.link || "/products"} className="view-all-btn">
            View All
          </Link>
        </div>
      </section>

      {/* Category Bento Grid */}
      <section className="home-section">
        <h2 className="home-section-heading">Shop by Category</h2>
        <p className="home-section-subheading">Find your perfect piece</p>
        <div className="hero-categories">
          <Link
            to="/products?category=unstitched"
            className="category-box"
          >
            <img
              src={unstitchedImg}
              alt="Unstitched Collection"
              className="category-image"
            />
            <div className="category-overlay">
              <h2 className="category-title">Unstitched</h2>
              <p className="category-shop-now">Shop Now</p>
            </div>
          </Link>
          <Link
            to="/products?category=winter"
            className="category-box"
          >
            <img
              src={winterImg}
              alt="Winter Collection"
              className="category-image"
            />
            <div className="category-overlay">
              <h2 className="category-title">Winter</h2>
              <p className="category-shop-now">Shop Now</p>
            </div>
          </Link>
          <Link
            to="/products?category=summer"
            className="category-box"
          >
            <img
              src={summerImg}
              alt="Summer Collection"
              className="category-image"
            />
            <div className="category-overlay">
              <h2 className="category-title">Summer</h2>
              <p className="category-shop-now">Shop Now</p>
            </div>
          </Link>
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
          >
            <source src={showcaseVideo} type="video/mp4" />
          </video>
        </div>
        <div className="showcase-text">
          <h2 className="showcase-heading">Crafted with Passion</h2>
          <p className="showcase-description">
            Every piece in our collection tells a story of tradition, elegance, and meticulous craftsmanship. 
            Discover fabrics that drape beautifully and designs that turn heads.
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
