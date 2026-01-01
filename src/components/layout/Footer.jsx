import { Link } from "react-router-dom";
import { useState } from "react";
import "../../styles/components/Footer.css";
import instagram from "../../assets/instagram.png";
import facebook from "../../assets/facebook.png";

export default function Footer() {
  const [openSections, setOpenSections] = useState({
    contact: false,
    customerService: false,
    about: false,
    newsletter: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Contact Us */}
        <div className="footer-section">
          <button
            className="footer-heading-btn"
            onClick={() => toggleSection("contact")}
          >
            <h4 className="footer-heading">Contact Us</h4>
            <span
              className={`toggle-icon ${openSections.contact ? "open" : ""}`}
            >
              +
            </span>
          </button>
          <div
            className={`footer-section-content ${
              openSections.contact ? "open" : ""
            }`}
          >
            <div className="contact-info">
              <p>21 Km Ferozpur Road</p>
              <p>Lahore Pakistan</p>
              <p className="contact-email">nishatonline@nishatmills.com</p>
              <p className="contact-phone">+92 42 111 647 428</p>
            </div>
          </div>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <button
            className="footer-heading-btn"
            onClick={() => toggleSection("customerService")}
          >
            <h4 className="footer-heading">Customer Service</h4>
            <span
              className={`toggle-icon ${
                openSections.customerService ? "open" : ""
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`footer-section-content ${
              openSections.customerService ? "open" : ""
            }`}
          >
            <ul className="footer-links">
              <li>
                <Link to="/shipping">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/size-guide">Order Tracking</Link>
              </li>
              <li>
                <Link to="/care-instructions">Contact Us</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* About */}
        <div className="footer-section">
          <button
            className="footer-heading-btn"
            onClick={() => toggleSection("about")}
          >
            <h4 className="footer-heading">About</h4>
            <span className={`toggle-icon ${openSections.about ? "open" : ""}`}>
              +
            </span>
          </button>
          <div
            className={`footer-section-content ${
              openSections.about ? "open" : ""
            }`}
          >
            <ul className="footer-links">
              <li>
                <Link to="/about">Our Story</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <button
            className="footer-heading-btn"
            onClick={() => toggleSection("newsletter")}
          >
            <h4 className="footer-heading">Stay Connected</h4>
            <span
              className={`toggle-icon ${openSections.newsletter ? "open" : ""}`}
            >
              +
            </span>
          </button>
          <div
            className={`footer-section-content ${
              openSections.newsletter ? "open" : ""
            }`}
          >
            <p className="newsletter-text">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
            <div className="footer-socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={instagram} alt="Instagram" className="social-icon" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={facebook} alt="Facebook" className="social-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; 2025 Libaayah. All rights reserved.</p>
        <div className="payment-methods">
          <span>We accept:</span>
          <span className="payment-badge">Visa</span>
          <span className="payment-badge">Jazzcash</span>
          <span className="payment-badge">Easypaisa</span>
        </div>
      </div>
    </footer>
  );
}
