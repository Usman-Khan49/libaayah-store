import { useState } from "react";
import ProductCard from "../product/ProductCard";
import "../../styles/components/ProductsCarousel.css";

export default function ProductsCarousel({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 4;
  const scrollStep = 1;
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - visibleCount;

  const handleScrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex((prev) => Math.max(0, prev - scrollStep));
    }
  };

  const handleScrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex((prev) =>
        Math.min(products.length - visibleCount, prev + scrollStep)
      );
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
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
  );
}
