import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getProduct,
  getAllProducts,
  getCollectionByHandle,
  getCollections,
  getProductReels,
  getShoppableReels,
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

const getGalleryImageSrc = (image) => {
  return (
    image?.url ||
    image?.url_1200 ||
    image?.url_900 ||
    image?.url_600 ||
    image?.url_1600 ||
    ""
  );
};

const getGalleryImageSrcSet = (image) => {
  return [
    image?.url_600 && `${image.url_600} 600w`,
    image?.url_900 && `${image.url_900} 900w`,
    image?.url_1200 && `${image.url_1200} 1200w`,
    image?.url_1600 && `${image.url_1600} 1600w`,
    image?.url && `${image.url} 1200w`,
  ]
    .filter(Boolean)
    .join(", ");
};

export default function ProductPage() {
  const { handle } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const collectionParam =
    searchParams.get("collection") || searchParams.get("category");
  const fabricParam = searchParams.get("fabric");
  const { addItem, checkout } = useCart();
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
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [productReels, setProductReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [reelsError, setReelsError] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [reelMuted, setReelMuted] = useState(true);
  const [reelProgress, setReelProgress] = useState(0);
  const previewVideoRef = useRef(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(false);
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
        setError(true);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, retryKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchReels = async () => {
      try {
        setReelsError(false);
        setReelsLoading(true);
        const reels = await getProductReels(handle, 10);
        let nextReels = reels || [];

        if (nextReels.length === 0) {
          const allReels = await getShoppableReels(20);
          nextReels = (allReels || []).filter(
            (reel) => reel?.product?.handle === handle,
          );
        }

        if (!cancelled) {
          setProductReels(nextReels);
        }
      } catch (err) {
        console.error("Error fetching product reels:", err);
        if (!cancelled) {
          setReelsError(true);
        }
      } finally {
        if (!cancelled) {
          setReelsLoading(false);
        }
      }
    };

    fetchReels();

    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (selectedReelIndex !== null && selectedReelIndex >= productReels.length) {
      setSelectedReelIndex(null);
    }
  }, [productReels, selectedReelIndex]);

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
      const didRedirect = checkout(cartData?.checkoutUrl);
      if (!didRedirect) {
        console.error("No checkout URL found after adding item.");
      }
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

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  const handleReelRetry = () => {
    setReelsLoading(true);
    setReelsError(false);
    getProductReels(handle, 10)
      .then((reels) => {
        setProductReels(reels || []);
      })
      .catch((err) => {
        console.error("Error fetching product reels:", err);
        setReelsError(true);
      })
      .finally(() => setReelsLoading(false));
  };

  const getReelVideoSource = (reel) => {
    const sources = reel?.video?.sources || [];
    const mp4 = sources.find((source) =>
      source?.mimeType?.toLowerCase().includes("mp4"),
    );
    return (mp4 || sources[0])?.url || null;
  };

  const getReelPosterImage = (reel) => {
    return (
      reel?.thumbnail?.image ||
      reel?.video?.previewImage ||
      reel?.product?.featuredImage ||
      null
    );
  };

  const getReelPosterUrl = (image) => {
    return (
      image?.url ||
      image?.url_480 ||
      image?.url_360 ||
      image?.url_240 ||
      image?.url_120 ||
      image?.url_80 ||
      ""
    );
  };

  const getReelPosterSrcSet = (image) => {
    if (!image) return "";
    const candidates = [
      image.url_60 && `${image.url_60} 60w`,
      image.url_80 && `${image.url_80} 80w`,
      image.url_120 && `${image.url_120} 120w`,
      image.url_240 && `${image.url_240} 240w`,
      image.url_360 && `${image.url_360} 360w`,
      image.url_480 && `${image.url_480} 480w`,
    ].filter(Boolean);

    const fallbackWidth = image.url_240 ? 600 : 240;
    if (image.url) {
      candidates.push(`${image.url} ${fallbackWidth}w`);
    }

    return candidates.join(", ");
  };

  const openReelModal = (index) => {
    setSelectedReelIndex(index);
    setReelProgress(0);
  };

  const closeReelModal = () => {
    setSelectedReelIndex(null);
    setReelProgress(0);
  };

  const navigateReel = (direction) => {
    if (selectedReelIndex === null) return;

    if (direction === "prev") {
      setSelectedReelIndex((prev) =>
        prev > 0 ? prev - 1 : productReels.length - 1,
      );
    } else {
      setSelectedReelIndex((prev) =>
        prev < productReels.length - 1 ? prev + 1 : 0,
      );
    }
  };

  useEffect(() => {
    if (!previewVideoRef.current) return;
    previewVideoRef.current.play().catch((err) => {
      console.log("Preview autoplay blocked:", err);
    });
  }, [productReels]);

  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const nextProgress = (video.currentTime / video.duration) * 100;
      setReelProgress(nextProgress);
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [selectedReelIndex]);

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

  if (error) {
    return (
      <div className="product-page-container">
        <div className="product-error">
          <h2>We could not load this product.</h2>
          <p>Please try again in a moment.</p>
          <div className="product-error-actions">
            <button className="product-error-btn" onClick={handleRetry}>
              Try Again
            </button>
            <Link to="/products" className="product-error-link">
              Back to Products
            </Link>
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
  const mainImageNode =
    images[selectedImage]?.node || images[0]?.node || null;
  const mainImageSrc = getGalleryImageSrc(mainImageNode);
  const mainImageSrcSet = getGalleryImageSrcSet(mainImageNode);
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
  const previewReel = productReels[0] || null;
  const previewVideo = getReelVideoSource(previewReel);
  const previewPosterImage = getReelPosterImage(previewReel);
  const previewPoster = getReelPosterUrl(previewPosterImage);
  const previewPosterSrcSet = getReelPosterSrcSet(previewPosterImage);
  const activeReel =
    selectedReelIndex !== null ? productReels[selectedReelIndex] : null;
  const activeReelPosterImage = getReelPosterImage(activeReel);
  const activeReelPoster = getReelPosterUrl(activeReelPosterImage);
  const activeReelProduct = activeReel?.product || product;
  const reelPrice =
    activeReel?.product?.priceRange?.minVariantPrice || price;

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
              src={mainImageSrc}
              srcSet={mainImageSrcSet || undefined}
              sizes="100vw"
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
              const imageSrc = getGalleryImageSrc(img.node);
              const imageSrcSet = getGalleryImageSrcSet(img.node);
              const imageSizes = isFirstImage || isLastAndOdd
                ? "(max-width: 768px) 100vw, 60vw"
                : "(max-width: 768px) 50vw, 30vw";
              return (
                <div
                  key={index}
                  className={`gallery-image ${
                    isFirstImage || isLastAndOdd ? "full-width" : ""
                  } ${selectedImage === index ? "active" : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={imageSrc}
                    srcSet={imageSrcSet || undefined}
                    sizes={imageSizes}
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

      {previewReel && !reelsLoading && !reelsError && (
        <button
          type="button"
          className="pdp-reel-preview"
          onClick={() => openReelModal(0)}
          aria-label="Watch product reel"
        >
          <div className="pdp-reel-video-wrapper">
            {previewVideo ? (
              <video
                ref={previewVideoRef}
                className="pdp-reel-video"
                src={previewVideo}
                poster={previewPoster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={(e) => {
                  e.target.play().catch((err) => {
                    console.log("Preview autoplay blocked:", err);
                  });
                }}
              />
            ) : (
              previewPoster && (
                <img
                  src={previewPoster}
                  srcSet={previewPosterSrcSet || undefined}
                  sizes="(max-width: 768px) 110px, 130px"
                  alt={previewReel?.title || "Product reel"}
                  className="pdp-reel-video"
                  loading="lazy"
                  decoding="async"
                />
              )
            )}
            <span className="pdp-reel-play" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </div>
        </button>
      )}

      {reelsError && !reelsLoading && (
        <button
          type="button"
          className="pdp-reel-retry"
          onClick={handleReelRetry}
        >
          Retry Reels
        </button>
      )}

      {selectedReelIndex !== null && activeReel && (
        <div className="reel-modal" onClick={closeReelModal}>
          <button className="reel-modal-close" onClick={closeReelModal}>
            ×
          </button>

          {productReels.length > 1 && (
            <button
              className="reel-modal-nav reel-nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                navigateReel("prev");
              }}
            >
              ←
            </button>
          )}

          <div
            className="reel-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reel-modal-video-wrapper">
              <div className="reel-progress-bar">
                <div
                  className="reel-progress-fill"
                  style={{ width: `${reelProgress}%` }}
                />
              </div>

              <button
                className="reel-volume-btn"
                onClick={() => setReelMuted(!reelMuted)}
              >
                {reelMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              <video
                ref={modalVideoRef}
                className="reel-modal-video"
                src={getReelVideoSource(activeReel)}
                poster={activeReelPoster}
                autoPlay
                loop
                playsInline
                muted={reelMuted}
                preload="metadata"
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              />

              <div className="reel-modal-product-card">
                <div className="prod-detail-container">
                  {activeReelProduct?.featuredImage?.url && (
                    <img
                      src={activeReelProduct.featuredImage.url}
                      alt={activeReelProduct.title}
                      className="reel-product-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="reel-product-details">
                    <p className="reel-product-code">
                      {activeReelProduct?.title || "View Product"}
                    </p>
                    {reelPrice && (
                      <p className="reel-product-price">
                        {formatPrice(reelPrice)}
                      </p>
                    )}
                  </div>
                </div>
                {activeReelProduct?.handle && (
                  <Link
                    to={`/product/${activeReelProduct.handle}`}
                    className="reel-add-to-cart"
                  >
                    View Product
                  </Link>
                )}
              </div>
            </div>
          </div>

          {productReels.length > 1 && (
            <button
              className="reel-modal-nav reel-nav-next"
              onClick={(e) => {
                e.stopPropagation();
                navigateReel("next");
              }}
            >
              →
            </button>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
