import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import { formatPrice } from "../../utils";
import "../../styles/components/ProductCard.css";
import heartIcon from "../../assets/heart.png";
import heartEnabledIcon from "../../assets/heartEnabled.png";

export default function ProductCard({ product }) {
  const location = useLocation();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const productLink = location.search
    ? `/product/${product.handle}${location.search}`
    : `/product/${product.handle}`;
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const variantId = product.variants.edges[0]?.node.id;
    if (!variantId || isAdding) return;

    try {
      setIsAdding(true);
      await addItem(variantId, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      to={productLink}
      className="productCard"
      key={product.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="productImageWrapper">
        <img
          src={product.images.edges[0]?.node.url}
          alt={product.title || "Product"}
          className="productImage"
          loading="lazy"
          decoding="async"
        />
        {/* Add to Cart Button on Hover */}
        {isHovered && (
          <button
            className={`add-to-cart-overlay ${isAdded ? "added" : ""}`}
            onClick={handleAddToCart}
            aria-label="Add to cart"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : isAdded ? "Added ✓" : "Add to Cart"}
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="productDetail">
        <div className="productInfo">
          <div className="productTitle">{product.title}</div>
          <div className="productPrice">
            {formatPrice(product.variants.edges[0]?.node.price)}
          </div>
        </div>
        {/* Wishlist Button */}
        <button
          className={`wishlist-heart ${inWishlist ? "active" : ""}`}
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
        >
          <img
            src={inWishlist ? heartEnabledIcon : heartIcon}
            alt="Wishlist"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>
    </Link>
  );
}
