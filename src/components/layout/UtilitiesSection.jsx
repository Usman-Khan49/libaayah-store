import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { buildCdnSrcSet, buildCdnUrl, CDN_ASSETS } from "../../utils";
import "../../styles/components/UtilitiesSection.css";

const UTILITY_ICON_WIDTHS = [48, 96];

export default function UtilitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipe = 50;
    if (diff > minSwipe && currentIndex < 2) {
      setCurrentIndex((prev) => prev + 1);
    } else if (diff < -minSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const utilities = [
    {
      id: 1,
      icon: CDN_ASSETS.tracking,
      title: "Track your order",
      description: "Click here for quick update",
      isLink: true,
      linkTo: "/orders",
    },
    {
      id: 2,
      icon: CDN_ASSETS.support,
      title: "SUPPORT 24/7",
      description: "Contact us 24 hours a day, 7 days a week",
      isLink: false,
    },
    {
      id: 3,
      icon: CDN_ASSETS.money,
      title: "Payment Methods",
      description: "COD, Credit Card: Visa, MasterCard, easypaisa, jazzcash",
      isLink: false,
    },
  ];

  return (
    <section className="utilities-section">
      <div
        className="utilities-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {utilities.map((utility, index) => {
          const content = (
            <>
              <img
                src={buildCdnUrl(utility.icon, { width: 48 })}
                srcSet={buildCdnSrcSet(utility.icon, UTILITY_ICON_WIDTHS)}
                sizes="48px"
                alt={utility.title}
                className="utility-icon"
              />
              <div className="utility-info">
                <h3 className="utility-title">{utility.title}</h3>
                <p className="utility-description">{utility.description}</p>
              </div>
            </>
          );

          return utility.isLink ? (
            <Link
              key={utility.id}
              to={utility.linkTo}
              className={`utility-item utility-link ${
                index === currentIndex ? "active" : ""
              }`}
            >
              {content}
            </Link>
          ) : (
            <div
              key={utility.id}
              className={`utility-item ${
                index === currentIndex ? "active" : ""
              }`}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Dot Indicators for Mobile */}
      <div className="utility-dots">
        {utilities.map((_, index) => (
          <button
            key={index}
            className={`utility-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to utility ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
