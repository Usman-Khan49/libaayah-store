import { useState } from "react";
import ProductCard from "../product/ProductCard";
import "../../styles/components/ProductsCarousel.css";

export default function ProductsCarousel({ products, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 4; // Number of products visible at once
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - visibleCount;

  const handleScrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleScrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="products-carousel-section">
      <h2 className="section-heading">{title}</h2>
      <div className="products-carousel-wrapper">
        {canScrollLeft && (
          <button
            className="carousel-btn carousel-btn-left"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div className="products-carousel-container">
          <div
            className="products-carousel-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="product-carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {canScrollRight && (
          <button
            className="carousel-btn carousel-btn-right"
            onClick={handleScrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}
