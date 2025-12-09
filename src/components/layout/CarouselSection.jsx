import { useState, useEffect, useRef } from "react";
import { getAllProducts } from "../../lib/shopify";
import { ProductCard } from "../product";
import "../../styles/components/CarouselSection.css";

export default function Carousel({ title }) {
  const [products, setProducts] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts(20);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!carouselRef.current || products.length === 0) return;

    const interval = setInterval(() => {
      const container = carouselRef.current;
      const cardWidth =
        container.querySelector(".product-card")?.offsetWidth || 0;
      const gap = 32; // 2rem gap
      const scrollAmount = cardWidth + gap;

      // Check if we're at the end
      if (
        container.scrollLeft + container.offsetWidth >=
        container.scrollWidth - 10
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [products]);

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth =
      container.querySelector(".product-card")?.offsetWidth || 0;
    const gap = 32;
    const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="carousel-wrapper">
      <h1 className="carousel-title">{title}</h1>

      <div className="carousel-container">
        <button
          className="carousel-arrow left"
          onClick={() => scroll("left")}
          aria-label="Previous products"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="carousel" ref={carouselRef}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <button
          className="carousel-arrow right"
          onClick={() => scroll("right")}
          aria-label="Next products"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
