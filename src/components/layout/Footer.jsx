import { Link } from "react-router-dom";
import { useState } from "react";
import "../../styles/components/Footer.css";
import instagram from "../../assets/instagram.png";
import facebook from "../../assets/facebook.png";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  const [openSections, setOpenSections] = useState({
    contact: false,
    customerService: false,
    about: false,
    newsletter: false,
  });

  const currentYear = new Date().getFullYear();

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();

    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setNewsletterStatus("Please enter a valid email address.");
      return;
    }

    try {
      const storageKey = "libaayah_newsletter_subscribers";
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
      setNewsletterStatus("Subscribed successfully. Thank you.");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("Subscribed successfully. Thank you.");
      setNewsletterEmail("");
    }
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
              <p>Libaayah Official Store</p>
              <p>Lahore, Pakistan</p>
              <p className="contact-email">support@libaayah.com</p>
              <p className="contact-phone">+92 300 0000000</p>
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
                <Link to="/size-guide">Size Guide</Link>
              </li>
              <li>
                <Link to="/care-instructions">Care Instructions</Link>
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
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Your email"
                className="newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                aria-label="Email for newsletter"
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
            {newsletterStatus && <p className="newsletter-status">{newsletterStatus}</p>}
            <div className="footer-socials">
              <a
                href="https://instagram.com/libaayah"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={instagram}
                  alt="Instagram"
                  className="social-icon"
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <a
                href="https://facebook.com/libaayah"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={facebook}
                  alt="Facebook"
                  className="social-icon"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Libaayah. All rights reserved.</p>
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
