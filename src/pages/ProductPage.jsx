import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProduct, getAllProducts } from "../lib/shopify";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductPage.css";
import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import heartIcon from "../assets/heart.png";
import heartEnabledIcon from "../assets/heartEnabled.png";

export default function ProductPage() {
  const { handle } = useParams();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(handle);
        const allProducts = await getAllProducts(8);

        if (productData) {
          setProduct(productData);
          setRelatedProducts(
            allProducts.filter((p) => p.id !== productData.id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle]);

  const handleAddToCart = async () => {
    if (!product) return;

    const variant = product.variants.edges[0]?.node;
    if (variant) {
      try {
        setAddingToCart(true);
        await addItem(variant.id, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } catch (error) {
        console.error("Failed to add to cart:", error);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="product-page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-container">
        <div className="error">Product not found</div>
      </div>
    );
  }

  const images = product.images?.edges || [];
  const price = product.variants.edges[0]?.node.price.amount;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="product-page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-link">Home</span> &gt;{" "}
        <span className="breadcrumb-link">Trend Setters</span> &gt;{" "}
        <span className="breadcrumb-current">{product.handle}</span>
      </nav>

      {/* Main Product Section */}
      <section className="product-main">
        {/* Gallery Column - 2x2 Grid */}
        <div className="gallery">
          {/* Mobile Main Image */}
          <div className="mobile-main-image">
            <img
              src={images[selectedImage]?.node.url || images[0]?.node.url}
              alt={product.title}
            />
          </div>

          {/* Desktop Grid & Mobile Thumbnails */}
          <div className="gallery-grid">
            {images.map((img, index) => {
              const isFirstImage = index === 0;
              const remainingAfterFirst = images.length - 1;
              const isLastAndOdd =
                !isFirstImage &&
                remainingAfterFirst % 2 !== 0 &&
                index === images.length - 1;
              return (
                <div
                  key={index}
                  className={`gallery-image ${
                    isFirstImage || isLastAndOdd ? "full-width" : ""
                  } ${selectedImage === index ? "active" : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img.node.url}
                    alt={`${product.title} - Image ${index + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="product-details">
          <h1 className="product-title">{product.title}</h1>
          <p className="product-price">
            Rs. {parseFloat(price).toLocaleString("en-PK")}
          </p>

          <div className="divider"></div>

          {/* Specs */}
          <div className="specs-list">
            <div className="spec-item">
              <span className="spec-label">Color:</span>
              <span className="spec-value">Beige</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fabric of Saree:</span>
              <span className="spec-value">Maysuri</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fabric of Blouse:</span>
              <span className="spec-value">Raw Silk</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Actions Row */}
          <div className="actions-row">
            <div className="quantity-selector">
              <button className="qty-btn" onClick={decrementQuantity}>
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={incrementQuantity}>
                +
              </button>
            </div>
            {/* Add to Cart Button */}
            <button
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart
                ? "Adding..."
                : addedToCart
                ? "Added to Cart ✓"
                : "Add to Cart"}
            </button>
            <button
              className={`wishlist-button ${inWishlist ? "active" : ""}`}
              onClick={handleWishlistToggle}
            >
              <img
                src={inWishlist ? heartEnabledIcon : heartIcon}
                alt="Wishlist"
              />
            </button>
          </div>
          <button
            className="Buy-Now-Btn"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart
              ? "Processing..."
              : addedToCart
              ? "Added to Cart ✓"
              : "Buy Now"}
          </button>
          {/* Shipping Info Box */}
          <div className="shipping-info-box">
            <span className="truck-icon">🚚</span>
            <span>
              Get it between Saturday January 3rd - Monday January 5th
            </span>
          </div>

          {/* Accordion */}
          <div className="accordion">
            <button
              className="accordion-header"
              onClick={() => setDescriptionOpen(!descriptionOpen)}
            >
              <span>Detailed Description</span>
              <span className="accordion-icon">
                {descriptionOpen ? "−" : "+"}
              </span>
            </button>
            {descriptionOpen && (
              <div className="accordion-content">
                <p>{product.description || "No description available."}</p>
              </div>
            )}
          </div>

          {/* Footer Details */}
          <div className="footer-details">
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src={facebookIcon} alt="Facebook" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src={instagramIcon} alt="Instagram" />
              </a>
            </div>
            <p className="disclaimer">
              Disclaimer: These Images Are For Illustrative Purposes, Actual
              Color Of the Product May Slight Vary.
            </p>
          </div>
        </div>
      </section>

      {/* Similar Products Section */}
      <section className="related">
        <h2 className="related-heading">Similar Products</h2>
        <div className="related-grid">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
