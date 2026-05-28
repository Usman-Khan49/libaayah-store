import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";
import { formatPrice, buildCdnSrcSet, buildCdnUrl, CDN_ASSETS } from "../../utils";
import "../../styles/components/ProductCard.css";

const HEART_WIDTHS = [24, 48];

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
  const imageNode = product.images.edges[0]?.node;
  const imageSrc =
    imageNode?.url ||
    imageNode?.url_600 ||
    imageNode?.url_480 ||
    imageNode?.url_360 ||
    imageNode?.url_240;
  const imageSrcSet = [
    imageNode?.url_240 && `${imageNode.url_240} 240w`,
    imageNode?.url_360 && `${imageNode.url_360} 360w`,
    imageNode?.url_480 && `${imageNode.url_480} 480w`,
    imageNode?.url && `${imageNode.url} 600w`,
  ]
    .filter(Boolean)
    .join(", ");

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
          src={imageSrc}
          srcSet={imageSrcSet || undefined}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
            src={buildCdnUrl(
              inWishlist ? CDN_ASSETS.heartEnabled : CDN_ASSETS.heart,
              { width: 24 },
            )}
            srcSet={buildCdnSrcSet(
              inWishlist ? CDN_ASSETS.heartEnabled : CDN_ASSETS.heart,
              HEART_WIDTHS,
            )}
            sizes="24px"
            alt="Wishlist"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>
    </Link>
  );
}
