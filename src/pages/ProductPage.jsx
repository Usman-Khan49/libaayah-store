import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct } from "../lib/shopify";
import { useCart } from "../hooks/useCart";
import "../styles/pages/ProductPage.css";

export default function ProductPage() {
  const { handle } = useParams();
  const { addItem, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(handle);
        if (productData) {
          setProduct(productData);
          setSelectedVariant(productData.variants.edges[0]?.node || null);
          setError(null);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="product-page-container">
        <div className="loading">
          <h2>Loading product...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page-container">
        <div className="error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <Link to="/products" className="back-link">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-container">
        <div className="error">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="back-link">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.edges.map((edge) => edge.node);
  const variants = product.variants.edges.map((edge) => edge.node);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) {
      return;
    }

    try {
      setAddingToCart(true);
      setAddToCartSuccess(false);

      // Add item to cart using the variant ID
      await addItem(selectedVariant.id, 1);

      // Show success message
      setAddToCartSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-page-container">
      <nav className="breadcrumb">
        <Link to="/products">Products</Link>
        <span className="separator">›</span>
        <span>{product.title}</span>
      </nav>

      <div className="product-details">
        <div className="product-images">
          <div className="main-image">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.url}
                alt={images[selectedImage]?.altText || product.title}
              />
            ) : (
              <div className="no-image">No image available</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `Product ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>

          <div className="product-price">
            {selectedVariant && (
              <>
                <span className="current-price">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.compareAtPrice && (
                  <span className="compare-price">
                    {formatPrice(selectedVariant.compareAtPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="product-description">
            <p>{product.description}</p>
          </div>

          {variants.length > 1 && (
            <div className="product-variants">
              <h3>Options:</h3>
              <div className="variant-options">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`variant-option ${
                      selectedVariant?.id === variant.id ? "active" : ""
                    }`}
                    onClick={() => handleVariantChange(variant)}
                    disabled={!variant.availableForSale}
                  >
                    {variant.title}
                    {!variant.availableForSale && " (Sold Out)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              disabled={
                !selectedVariant?.availableForSale ||
                addingToCart ||
                cartLoading
              }
              onClick={handleAddToCart}
            >
              {addingToCart || cartLoading
                ? "Adding..."
                : addToCartSuccess
                ? "Added to Cart ✓"
                : selectedVariant?.availableForSale
                ? "Add to Cart"
                : "Sold Out"}
            </button>
            {addToCartSuccess && (
              <p className="success-message">
                Item added to cart successfully!
              </p>
            )}
          </div>

          {product.tags.length > 0 && (
            <div className="product-tags">
              <h4>Tags:</h4>
              <div className="tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
