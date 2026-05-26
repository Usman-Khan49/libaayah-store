import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShoppableReels } from "../../lib/shopify";
import { formatPrice } from "../../utils";
import "../../styles/components/ReelsSection.css";

export default function ReelsSection() {
  const [selectedReel, setSelectedReel] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRefs = useRef([]);
  const modalVideoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReels = async () => {
      try {
        setError(false);
        setLoading(true);
        const data = await getShoppableReels(20);
        if (!cancelled) {
          setReels(data || []);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReels();

    return () => {
      cancelled = true;
    };
  }, []);

  // Play/pause reels based on visibility to avoid loading all videos at once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const cards = Array.from(container.querySelectorAll(".reel-card"));
    if (cards.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");
          if (!video) return;

          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.log("Video autoplay prevented:", error);
            });
          } else {
            video.pause();
          }
        });
      },
      { root: container, threshold: 0.6 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [reels]);

  // Handle scroll to update focused card on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      const cards = container.querySelectorAll(".reel-card");
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(centerX - cardCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setFocusedIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Update progress bar
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [selectedReel]);
  useEffect(() => {
    if (selectedReel !== null && selectedReel >= reels.length) {
      setSelectedReel(null);
    }
  }, [reels, selectedReel]);

  const getReelVideoSource = (reel) => {
    const sources = reel?.video?.sources || [];
    const mp4 = sources.find((source) =>
      source?.mimeType?.toLowerCase().includes("mp4"),
    );
    return (mp4 || sources[0])?.url || null;
  };

  const getReelPoster = (reel) => {
    return (
      reel?.thumbnail?.image ||
      reel?.video?.previewImage ||
      null
    );
  };

  const getReelPosterUrl = (image, fallbackImage) => {
    return (
      image?.url ||
      image?.url_480 ||
      image?.url_360 ||
      image?.url_240 ||
      fallbackImage?.url ||
      fallbackImage?.url_120 ||
      fallbackImage?.url_80 ||
      fallbackImage?.url_60 ||
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

  const getReelLabel = (reel) => {
    return reel?.title || reel?.product?.title || "Featured";
  };

  const getReelColor = (reel) => {
    const color =
      reel?.product?.colorPattern?.value ||
      reel?.product?.colorMetafield?.value ||
      reel?.product?.colorMetafieldAlt?.value ||
      reel?.product?.colorMetafieldGlobal?.value;
    const normalized = color?.toString().trim();
    return normalized || null;
  };

  const getReelProductImage = (reel) => {
    return reel?.product?.featuredImage || null;
  };

  const getReelProductImageSrc = (image) => {
    return (
      image?.url ||
      image?.url_120 ||
      image?.url_80 ||
      image?.url_60 ||
      ""
    );
  };

  const getReelProductImageSrcSet = (image) => {
    return [
      image?.url_60 && `${image.url_60} 60w`,
      image?.url_80 && `${image.url_80} 80w`,
      image?.url_120 && `${image.url_120} 120w`,
      image?.url && `${image.url} 240w`,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const openReelModal = (index) => {
    setSelectedReel(index);
    setProgress(0);
  };

  const closeReelModal = () => {
    setSelectedReel(null);
    setProgress(0);
  };

  const navigateReel = (direction) => {
    if (selectedReel === null) return;

    if (direction === "prev") {
      setSelectedReel((prev) => (prev > 0 ? prev - 1 : reels.length - 1));
    } else {
      setSelectedReel((prev) => (prev < reels.length - 1 ? prev + 1 : 0));
    }
  };

  const handleVideoClick = (e, index) => {
    e.preventDefault();
    openReelModal(index);
  };

  if (!loading && (error || reels.length === 0)) {
    return null;
  }

  return (
    <section className="reels-section">
      <div className="reels-container" ref={containerRef}>
        {reels.map((reel, index) => {
          const videoUrl = getReelVideoSource(reel);

          const colorValue = getReelColor(reel);
          const productImage = getReelProductImage(reel);
          const productTitle = reel?.product?.title || getReelLabel(reel);
          const posterImage = getReelPoster(reel);
          const posterUrl = getReelPosterUrl(posterImage, productImage);
          const posterSrcSet = getReelPosterSrcSet(posterImage);
          const productThumbSrc = getReelProductImageSrc(productImage);
          const productThumbSrcSet = getReelProductImageSrcSet(productImage);

          return (
          <div
            key={reel.id}
            className={`reel-card ${index === focusedIndex ? "focused" : ""}`}
            onClick={(e) => handleVideoClick(e, index)}
          >
            <div className="reel-video-wrapper">
              {videoUrl ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="reel-video"
                  src={videoUrl}
                  poster={posterUrl}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onLoadedData={(e) => {
                    e.target.play().catch((err) => {
                      console.log("Autoplay blocked:", err);
                    });
                  }}
                  onError={(e) => {
                    console.log("Video failed to load:", videoUrl);
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "block";
                    }
                  }}
                />
              ) : null}
              {posterUrl ? (
                <img
                  src={posterUrl}
                  srcSet={posterSrcSet || undefined}
                  sizes="(max-width: 768px) 195px, 277px"
                  alt={getReelLabel(reel)}
                  className="reel-fallback"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}

              <div className="reel-overlay">
                <div className="reel-mini-card">
                  {productImage && (
                    <img
                      src={productThumbSrc}
                      srcSet={productThumbSrcSet || undefined}
                      sizes="36px"
                      alt={productTitle}
                      className="reel-mini-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="reel-mini-info">
                    <p className="reel-mini-title">{productTitle}</p>
                    {colorValue && (
                      <p className="reel-mini-color">Color: {colorValue}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Modal for expanded view */}
      {selectedReel !== null && reels[selectedReel] && (
        <div className="reel-modal" onClick={closeReelModal}>
          <button className="reel-modal-close" onClick={closeReelModal}>
            ×
          </button>

          <button
            className="reel-modal-nav reel-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              navigateReel("prev");
            }}
          >
            ←
          </button>

          <div
            className="reel-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reel-modal-video-wrapper">
              {/* Custom progress bar at top */}
              <div className="reel-progress-bar">
                <div
                  className="reel-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Volume control below progress bar */}
              <button
                className="reel-volume-btn"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
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
                src={getReelVideoSource(reels[selectedReel])}
                poster={getReelPoster(reels[selectedReel])}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                preload="metadata"
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Product card in modal */}
              <div className="reel-modal-product-card">
                <div className="prod-detail-container">
                  {reels[selectedReel]?.product?.featuredImage && (
                    <img
                      src={getReelProductImageSrc(
                        reels[selectedReel].product.featuredImage,
                      )}
                      srcSet={
                        getReelProductImageSrcSet(
                          reels[selectedReel].product.featuredImage,
                        ) || undefined
                      }
                      sizes="40px"
                      alt={reels[selectedReel].product.title}
                      className="reel-product-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="reel-product-details">
                    <p className="reel-product-code">
                      {reels[selectedReel]?.product?.title ||
                        getReelLabel(reels[selectedReel])}
                    </p>
                    {reels[selectedReel]?.product?.priceRange
                      ?.minVariantPrice && (
                      <p className="reel-product-price">
                        {formatPrice(
                          reels[selectedReel].product.priceRange
                            .minVariantPrice,
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {reels[selectedReel]?.product?.handle && (
                  <Link
                    to={`/product/${reels[selectedReel].product.handle}`}
                    className="reel-add-to-cart"
                  >
                    View Product
                  </Link>
                )}
              </div>
            </div>
          </div>

          <button
            className="reel-modal-nav reel-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              navigateReel("next");
            }}
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
