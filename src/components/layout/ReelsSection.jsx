import { useState, useRef, useEffect } from "react";
import "../../styles/components/ReelsSection.css";

export default function ReelsSection() {
  const [selectedReel, setSelectedReel] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const videoRefs = useRef([]);
  const modalVideoRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-play videos when component mounts
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.play().catch((error) => {
          console.log("Video autoplay prevented:", error);
        });
      }
    });
  }, []);

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

  // Sample reels data - replace with actual product videos
  const reels = [
    {
      id: 1,
      videoUrl: "/Sample-Reel-Video.mp4",
      thumbnail: "/fashion-model-in-coral-blazer-and-blue-top.jpg",
      productCode: "TW-24",
      productName: "Navy Embroidered Velvet",
      price: "Rs22,500",
      likes: 50,
      comments: 89,
    },
    {
      id: 2,
      videoUrl: "/Sample-Reel-Video.mp4",
      thumbnail: "/fashion-model-in-brown-oversized-coat-and-hat.jpg",
      productCode: "NW-115",
      productName: "Emerald Silk Collection",
      price: "Rs18,900",
      likes: 42,
      comments: 67,
    },
    {
      id: 3,
      videoUrl: "/Sample-Reel-Video.mp4",
      thumbnail: "/fashion-model-in-beige-hat-and-cream-outfit.jpg",
      productCode: "NW-116",
      productName: "Blush Pink Chiffon",
      price: "Rs15,500",
      likes: 38,
      comments: 54,
    },
    {
      id: 4,
      videoUrl: "/Sample-Reel-Video.mp4",
      thumbnail: "/fashion-model-in-orange-hoodie.jpg",
      productCode: "NW-117",
      productName: "Coral Summer Lawn",
      price: "Rs12,800",
      likes: 61,
      comments: 92,
    },
  ];

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

  return (
    <section className="reels-section">
      <h2 className="reels-title">Watch. Shop!</h2>

      <div className="reels-container" ref={containerRef}>
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`reel-card ${index === focusedIndex ? "focused" : ""}`}
            onClick={(e) => handleVideoClick(e, index)}
          >
            <div className="reel-video-wrapper">
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="reel-video"
                src={reel.videoUrl}
                poster={reel.thumbnail}
                muted
                loop
                playsInline
                onLoadedData={(e) => {
                  e.target.play().catch((err) => {
                    console.log("Autoplay blocked:", err);
                  });
                }}
                onError={(e) => {
                  // Fallback to thumbnail if video fails
                  console.log("Video failed to load:", reel.videoUrl);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <img
                src={reel.thumbnail}
                alt={reel.productName}
                className="reel-fallback"
              />

              {/* Simple overlay with product code */}
              <div className="reel-overlay">
                <span className="reel-product-code-badge">
                  {reel.productCode}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for expanded view */}
      {selectedReel !== null && (
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
                src={reels[selectedReel].videoUrl}
                poster={reels[selectedReel].thumbnail}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Right side action buttons in modal */}
              <div className="reel-modal-actions">
                <button className="reel-action-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="white"
                    />
                  </svg>
                  <span>{reels[selectedReel].likes}</span>
                </button>
                <button className="reel-action-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      fill="white"
                    />
                  </svg>
                  <span>{reels[selectedReel].comments}</span>
                </button>
              </div>

              {/* Product card in modal */}
              <div className="reel-modal-product-card">
                <div className="prod-detail-container">
                  <img
                    src={reels[selectedReel].thumbnail}
                    alt={reels[selectedReel].productName}
                    className="reel-product-thumb"
                  />
                  <div className="reel-product-details">
                    <p className="reel-product-code">
                      {reels[selectedReel].productCode}
                    </p>
                    <p className="reel-product-price">
                      {reels[selectedReel].price}
                    </p>
                  </div>
                </div>
                <button
                  className="reel-add-to-cart"
                  onClick={() => {
                    console.log(
                      "Add to cart:",
                      reels[selectedReel].productCode
                    );
                  }}
                >
                  ADD TO CART
                </button>
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
