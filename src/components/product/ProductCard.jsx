import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import "../../styles/components/ProductCard.css";
import heartIcon from "../../assets/heart.png";
import heartEnabledIcon from "../../assets/heartEnabled.png";

export default function ProductCard({ product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

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
    if (variantId) {
      await addItem(variantId, 1);
    }
  };

  return (
    <Link
      to={`/product/${product.handle}`}
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
        />
        {/* Add to Cart Button on Hover */}
        {isHovered && (
          <button
            className="add-to-cart-overlay"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            Add to Cart
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="productDetail">
        <div className="productInfo">
          <div className="productTitle">{product.title}</div>
          <div className="productPrice">
            Rs. {product.variants.edges[0]?.node.price.amount}
          </div>
        </div>
        {/* Wishlist Button */}
        <button
          className={`wishlist-heart ${inWishlist ? "active" : ""}`}
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
        >
          <img src={inWishlist ? heartEnabledIcon : heartIcon} alt="Wishlist" />
        </button>
      </div>
    </Link>
  );
}
