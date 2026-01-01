import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/components/UtilitiesSection.css";
import trackingIcon from "../../assets/tracking.png";
import supportIcon from "../../assets/support.png";
import moneyIcon from "../../assets/money.png";

export default function UtilitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const utilities = [
    {
      id: 1,
      icon: trackingIcon,
      title: "Track your order",
      description: "Click here for quick update",
      isLink: true,
      linkTo: "/orders",
    },
    {
      id: 2,
      icon: supportIcon,
      title: "SUPPORT 24/7",
      description: "Contact us 24 hours a day, 7 days a week",
      isLink: false,
    },
    {
      id: 3,
      icon: moneyIcon,
      title: "Payment Methods",
      description: "COD, Credit Card: Visa, MasterCard, easypaisa, jazzcash",
      isLink: false,
    },
  ];

  return (
    <section className="utilities-section">
      <div className="utilities-container">
        {utilities.map((utility, index) => {
          const content = (
            <>
              <img
                src={utility.icon}
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
