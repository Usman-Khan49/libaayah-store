import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../lib/shopify";
import { Footer } from "../components/layout";
import ReelsSection from "../components/layout/ReelsSection";
import ProductGrid from "../components/product/ProductGrid";
import UtilitiesSection from "../components/layout/UtilitiesSection";
import heroBannerVideo from "../assets/hero_banner.mp4";
import bottomBannerVideo from "../assets/bottom_banner.mp4";
import unstitchedImg from "../assets/img36.jpg";
import winterImg from "../assets/img88.jpg";
import summerImg from "../assets/img109.jpg";
import saleImg from "../assets/img127.jpg";
import "../styles/pages/HomePage.css";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const heroVideoRef = useRef(null);
  const bottomVideoRef = useRef(null);

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

  // Intersection Observer for video autoplay
  useEffect(() => {
    const heroVideo = heroVideoRef.current;
    const bottomVideo = bottomVideoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.log("Video autoplay prevented:", error);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );

    if (heroVideo) observer.observe(heroVideo);
    if (bottomVideo) observer.observe(bottomVideo);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="homepage-container">
      {/* Hero Banner - Full Viewport Height */}
      <section className="hero-banner-top">
        <video
          ref={heroVideoRef}
          className="hero-video"
          muted
          loop
          playsInline
          preload="auto"
          autoPlay
        >
          <source src={heroBannerVideo} type="video/mp4" />
        </video>
      </section>

      {/* Category Bento Grid */}
      <section className="hero-categories">
        <Link
          to="/products?category=unstitched"
          className="category-box category-large"
        >
          <img
            src={unstitchedImg}
            alt="Unstitched Collection"
            className="category-image"
          />
          <div className="category-overlay">
            <h2 className="category-title">Unstitched</h2>
            <p className="category-subtitle">
              Khaddar • Linen • Viscose • Lawn
            </p>
          </div>
        </Link>
        <Link
          to="/products?category=winter"
          className="category-box category-horizontal"
        >
          <img
            src={winterImg}
            alt="Winter Collection"
            className="category-image"
          />
          <div className="category-overlay">
            <h2 className="category-title">Winter Collection</h2>
          </div>
        </Link>
        <Link
          to="/products?category=summer"
          className="category-box category-small"
        >
          <img
            src={summerImg}
            alt="Summer Collection"
            className="category-image"
          />
          <div className="category-overlay">
            <h2 className="category-title">Summer</h2>
          </div>
        </Link>
        <Link
          to="/products?category=sale"
          className="category-box category-small"
        >
          <img src={saleImg} alt="Sale" className="category-image" />
          <div className="category-overlay">
            <h2 className="category-title">Sale</h2>
          </div>
        </Link>
      </section>

      {/* Reels Section */}
      <ReelsSection />

      {/* Winter Sale Grid */}
      <section className="winter-sale-section">
        <h2 className="section-heading">Winter Sale</h2>
        <ProductGrid products={products} />
      </section>

      {/* Visual Banner Module */}
      <section className="hero-banner">
        <video
          ref={bottomVideoRef}
          className="banner-video"
          muted
          loop
          playsInline
          preload="auto"
          autoPlay
        >
          <source src={bottomBannerVideo} type="video/mp4" />
        </video>
      </section>

      {/* Utilities Module */}
      <UtilitiesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
