import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/WishlistPage.css";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="wishlist-page">
      {/* Page Title */}
      <div className="wishlist-title-section">
        <h1 className="wishlist-title">Wishlist</h1>
      </div>

      {/* Wishlist Content */}
      <div className="wishlist-content">
        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <>
            {/* Wishlist Grid */}
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
