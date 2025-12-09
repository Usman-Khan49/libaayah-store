import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProduct, getAllProducts } from "../lib/shopify";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductPage.css";

export default function ProductPage() {
  const { handle } = useParams();
  const { addItem } = useCart();
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
          // Filter out current product from related products
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
  const mainImage = images[selectedImage]?.node;
  const price = product.variants.edges[0]?.node.price.amount;

  return (
    <div className="product-page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link">Home</span> /{" "}
        <span className="breadcrumb-link">WOMEN</span> /{" "}
        <span className="breadcrumb-link">3-Piece</span> /{" "}
        <span className="breadcrumb-link">Embroidered Suit</span> /{" "}
        <span className="breadcrumb-current">{product.handle}</span>
      </div>

      <div className="product-detail-section">
        {/* Left Side - Image Gallery */}
        <div className="image-gallery">
          <div className="thumbnail-list">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.node.url}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
          <div className="main-image">
            {mainImage && <img src={mainImage.url} alt={product.title} />}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.title}</h1>

          <div className="product-price">{`Rs.${price}`}</div>

          <div className="product-sku">SKU: {product.handle.toUpperCase()}</div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <button className="quantity-btn" onClick={decrementQuantity}>
              -
            </button>
            <input
              type="number"
              value={quantity}
              readOnly
              className="quantity-input"
            />
            <button className="quantity-btn" onClick={incrementQuantity}>
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart
              ? "ADDING..."
              : addedToCart
              ? "ADDED TO CART ✓"
              : "ADD TO CART"}
          </button>

          {/* Wishlist Button */}
          <button className="wishlist-btn">
            <span>♡</span>
          </button>

          {/* Description Accordion */}
          <div className="description-accordion">
            <button
              className="accordion-header"
              onClick={() => setDescriptionOpen(!descriptionOpen)}
            >
              <span>Description</span>
              <span>{descriptionOpen ? "-" : "+"}</span>
            </button>
            {descriptionOpen && (
              <div className="accordion-content">
                {product.description || "No description available."}
              </div>
            )}
          </div>

          {/* Social Share */}
          <div className="social-share">
            <button className="social-btn facebook">f</button>
            <button className="social-btn whatsapp">W</button>
            <button className="social-btn email">✉</button>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="related-products-section">
        <h2 className="section-title">You May Also Like</h2>
        <div className="related-products-grid">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
