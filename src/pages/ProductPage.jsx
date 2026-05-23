import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getProduct,
  getAllProducts,
  getCollectionByHandle,
  getCollections,
} from "../lib/shopify";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../utils";
import Skeleton from "../components/Skeleton";
import ProductCard from "../components/product/ProductCard";
import { Footer } from "../components/layout";
import "../styles/pages/ProductPage.css";
import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import heartIcon from "../assets/heart.png";
import heartEnabledIcon from "../assets/heartEnabled.png";

const toTitleCase = (value) =>
  value
    ?.toString()
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeValue = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatCollectionLabel = (value) => {
  const formatted = toTitleCase(value);
  if (!formatted) return "";
  const match = formatted.match(/^(.*?)(\s+Collection\b.*)?$/i);
  return match?.[1]?.trim() || formatted;
};

const getMetafieldValue = (value) => {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
};

const getTagValue = (tags, key) => {
  if (!Array.isArray(tags)) return null;
  const normalizedKey = normalizeValue(key);
  const match = tags.find((tag) => {
    const [prefix, rest] = tag.split(":");
    return normalizeValue(prefix) === normalizedKey && rest;
  });
  return match ? match.split(":").slice(1).join(":").trim() : null;
};

const findCollectionMatch = (label, collections) => {
  const normalizedLabel = normalizeValue(label);
  return (
    collections.find(
      (collection) => normalizeValue(collection.title) === normalizedLabel,
    ) ||
    collections.find(
      (collection) => normalizeValue(collection.handle) === normalizedLabel,
    ) ||
    collections.find((collection) =>
      normalizeValue(collection.title).includes(normalizedLabel),
    ) ||
    collections.find((collection) =>
      normalizeValue(collection.handle).includes(normalizedLabel),
    ) ||
    null
  );
};

const getOptionValue = (variant, label) => {
  if (!variant?.selectedOptions) return null;
  const match = variant.selectedOptions.find(
    (option) => option.name?.toLowerCase() === label.toLowerCase(),
  );
  return match?.value || null;
};

export default function ProductPage() {
  const { handle } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionParam =
    searchParams.get("collection") || searchParams.get("category");
  const fabricParam = searchParams.get("fabric");
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const [resolvedCollection, setResolvedCollection] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(handle);
        const allProducts = await getAllProducts(8);

        if (productData) {
          setProduct(productData);
          setRelatedProducts(
            allProducts.filter((p) => p.id !== productData.id).slice(0, 4),
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

  useEffect(() => {
    let cancelled = false;

    const resolveCollection = async () => {
      if (!collectionParam) {
        setResolvedCollection(null);
        return;
      }

      try {
        const byHandle = await getCollectionByHandle(collectionParam);
        if (cancelled) return;

        if (byHandle) {
          setResolvedCollection(byHandle);
          return;
        }

        const collections = await getCollections(30);
        if (cancelled) return;

        const match = findCollectionMatch(collectionParam, collections);
        setResolvedCollection(match);
      } catch (error) {
        if (!cancelled) {
          console.error("Error resolving collection:", error);
          setResolvedCollection(null);
        }
      }
    };

    resolveCollection();

    return () => {
      cancelled = true;
    };
  }, [collectionParam]);

  const handleAddToCart = async () => {
    if (!product) return;

    const variant = product.variants.edges[0]?.node;
    const maxQuantity = Number.isFinite(variant?.quantityAvailable)
      ? variant.quantityAvailable
      : null;
    const safeQuantity =
      maxQuantity !== null ? Math.min(quantity, maxQuantity) : quantity;

    if (variant) {
      try {
        setAddingToCart(true);
        if (safeQuantity < 1) return;
        if (safeQuantity !== quantity) {
          setQuantity(safeQuantity);
        }
        await addItem(variant.id, safeQuantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } catch (error) {
        console.error("Failed to add to cart:", error);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    const variant = product.variants.edges[0]?.node;
    if (!variant) return;
    const maxQuantity = Number.isFinite(variant?.quantityAvailable)
      ? variant.quantityAvailable
      : null;
    const safeQuantity =
      maxQuantity !== null ? Math.min(quantity, maxQuantity) : quantity;

    if (safeQuantity < 1) return;
    if (safeQuantity !== quantity) {
      setQuantity(safeQuantity);
    }

    try {
      setBuyingNow(true);
      const cartData = await addItem(variant.id, safeQuantity);
      if (cartData?.checkoutUrl) {
        window.location.href = cartData.checkoutUrl;
        return;
      }
      console.error("No checkout URL found after adding item.");
    } catch (error) {
      console.error("Failed to process Buy Now:", error);
    } finally {
      setBuyingNow(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const variant = product?.variants?.edges?.[0]?.node;
  const maxQuantity = Number.isFinite(variant?.quantityAvailable)
    ? variant.quantityAvailable
    : null;
  const minQuantity = maxQuantity === 0 ? 0 : 1;

  const triggerLimitHit = () => {
    setLimitHit(true);
    setTimeout(() => setLimitHit(false), 200);
  };

  const incrementQuantity = () => {
    if (maxQuantity !== null && quantity >= maxQuantity) {
      triggerLimitHit();
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () =>
    setQuantity((prev) => (prev > minQuantity ? prev - 1 : minQuantity));

  useEffect(() => {
    if (maxQuantity === null) return;

    setQuantity((prev) => {
      if (maxQuantity === 0) return 0;
      if (prev < minQuantity) return minQuantity;
      if (prev > maxQuantity) return maxQuantity;
      return prev;
    });
  }, [maxQuantity, minQuantity]);

  if (loading) {
    return (
      <div className="product-page-container">
        <div className="skeleton-page" style={{ marginTop: "24px" }}>
          <Skeleton className="skeleton-subtitle" />
          <div className="skeleton-product-layout">
            <div className="skeleton-gallery">
              <Skeleton className="skeleton-gallery-item" />
              <Skeleton className="skeleton-gallery-item" />
              <Skeleton className="skeleton-gallery-item" />
              <Skeleton className="skeleton-gallery-item" />
            </div>
            <div className="skeleton-details">
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-line short" />
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-button" />
              <Skeleton className="skeleton-button" />
            </div>
          </div>
        </div>
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
  const price = variant?.price;
  const colorValue =
    getMetafieldValue(product.colorPattern?.value) ||
    getMetafieldValue(product.colorMetafield?.value) ||
    getMetafieldValue(product.colorMetafieldAlt?.value) ||
    getMetafieldValue(product.colorMetafieldGlobal?.value) ||
    getMetafieldValue(getOptionValue(variant, "color")) ||
    getMetafieldValue(getOptionValue(variant, "colour")) ||
    getTagValue(product.tags, "color") ||
    getTagValue(product.tags, "colour");
  const fabricValue =
    product.fabricMetafield?.value || getOptionValue(variant, "fabric");
  const collectionLabel = collectionParam
    ? formatCollectionLabel(
        resolvedCollection?.title ||
          resolvedCollection?.handle ||
          collectionParam,
      )
    : "All Products";
  const collectionHandle = resolvedCollection?.handle || collectionParam;
  const fabricLabel = fabricParam ? toTitleCase(fabricParam) : null;
  const canAddToCart = maxQuantity === null ? true : maxQuantity > 0;
  const addDisabled = addingToCart || !canAddToCart;
  const buyDisabled = buyingNow || addingToCart || !canAddToCart;
  const inWishlist = isInWishlist(product.id);
  const descriptionHtml = product.descriptionHtml || "";

  return (
    <div className="product-page-container">
      {/* Breadcrumb */}
      <nav className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">
          Home
        </Link>
        <span className="breadcrumb-separator">&gt;</span>
        <Link
          to={
            collectionHandle
              ? `/products?collection=${encodeURIComponent(collectionHandle)}`
              : "/products"
          }
          className="breadcrumb-link"
        >
          {collectionLabel}
        </Link>
        {fabricLabel && (
          <>
            <span className="breadcrumb-separator">&gt;</span>
            <Link
              to={`/products?collection=${encodeURIComponent(collectionHandle || "")}&fabric=${encodeURIComponent(fabricParam)}`}
              className="breadcrumb-link"
            >
              {fabricLabel}
            </Link>
          </>
        )}
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">{product.title}</span>
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
          <p className="product-price">{formatPrice(price)}</p>

          <div className="divider"></div>

          {/* Specs */}
          <div className="specs-list">
            <div className="spec-item">
              <span className="spec-label">Color:</span>
              <span className="spec-value">
                {colorValue || "Not specified"}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fabric type:</span>
              <span className="spec-value">
                {fabricValue || "Not specified"}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Actions Row */}
          <div className="actions-row">
            <div className={`quantity-selector ${limitHit ? "limit-hit" : ""}`}>
              <button
                className="qty-btn"
                onClick={decrementQuantity}
                disabled={quantity <= minQuantity}
              >
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
              disabled={addDisabled}
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
            onClick={handleBuyNow}
            disabled={buyDisabled}
          >
            {buyingNow ? "Redirecting to Checkout..." : "Buy Now"}
          </button>
          {/* Shipping Info Box */}
          <div className="shipping-info-box">
            <span className="truck-icon">🚚</span>
            <span>Delivery in 3-4 business days.</span>
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
                {descriptionHtml ? (
                  <div
                    className="product-description"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p>{product.description || "No description available."}</p>
                )}
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
