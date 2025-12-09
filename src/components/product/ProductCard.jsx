import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import "../../styles/components/ProductCard.css";

export default function ProductCard({ product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link
      to={`/product/${product.handle}`}
      className="productCard"
      key={product.id}
    >
      {/* Wishlist Heart Icon */}
      <button
        className={`wishlist-heart ${inWishlist ? "active" : ""}`}
        onClick={handleWishlistClick}
        aria-label="Add to wishlist"
      >
        {inWishlist ? "❤️" : "🤍"}
      </button>

      {/* Product Image */}
      <img
        src={product.images.edges[0]?.node.url}
        alt={product.title || "Product"}
        className="productImage"
      />
      {/* Product Details */}
      <div className="productDetail">
        <div className="productTitle">{product.title}</div>
        <div className="unstitched">Unstitched</div>
        <div className="category">New In</div>
        <div className="productPrice">
          {`Rs. ${product.variants.edges[0]?.node.price.amount} ${product.variants.edges[0]?.node.price.currencyCode}`}
        </div>
      </div>
    </Link>
  );
}
