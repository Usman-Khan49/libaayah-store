import { Link } from "react-router-dom";
import "../../styles/components/Footer.css";
import instagram from "../../assets/instagram.png";
import facebook from "../../assets/facebook.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Contact Us */}
        <div className="footer-section">
          <h4 className="footer-heading">Contact Us</h4>
          <div className="contact-info">
            <p>21 Km Ferozpur Road</p>
            <p>Lahore Pakistan</p>
            <p className="contact-email">nishatonline@nishatmills.com</p>
            <p className="contact-phone">+92 42 111 647 428</p>
          </div>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h4 className="footer-heading">Customer Service</h4>
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

        {/* About */}
        <div className="footer-section">
          <h4 className="footer-heading">About</h4>
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

        {/* Newsletter */}
        <div className="footer-section">
          <h4 className="footer-heading">Stay Connected</h4>
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
