import { Link } from "react-router-dom";
import { useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import "../../styles/components/Header.css";
import logoImg from "../../assets/Logo.png";
import searchIcon from "../../assets/search.png";
import userIcon from "../../assets/user.png";
import heartIcon from "../../assets/heart.png";
import cartIcon from "../../assets/cart.png";

export default function Header() {
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left Section - Desktop */}
        <div className="header-left desktop-only">
          <button className="icon-btn" aria-label="Search">
            <img src={searchIcon} alt="Search" />
          </button>
          <button className="icon-btn" aria-label="User Profile">
            <img src={userIcon} alt="User" />
          </button>
        </div>

        {/* Hamburger Menu - Mobile */}
        <button
          className="hamburger-btn mobile-only"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        </button>

        {/* Center Section */}
        <nav className="header-center">
          <Link to="/products" className="nav-link desktop-only">
            Unstitched
          </Link>
          <Link to="/products" className="nav-link desktop-only">
            Winter Collection
          </Link>
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="Libaayah" className="logo-img" />
          </Link>
          <Link to="/products" className="nav-link desktop-only">
            Summer Collection
          </Link>
          <Link to="/products" className="nav-link sale desktop-only">
            Sale!
          </Link>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <img src={heartIcon} alt="Wishlist" />
            {wishlistCount > 0 && (
              <span className="icon-badge">{wishlistCount}</span>
            )}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Shopping Bag">
            <img src={cartIcon} alt="Cart" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">

          <div className="mobile-menu-heading">Menu</div>
          {/* Search Bar */}
          {/* <div className="mobile-search">
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div> */}

          {/* Navigation Links */}
          <nav className="mobile-nav">
            <Link
              to="/products"
              className="mobile-nav-link sale"
              onClick={toggleMenu}
            >
              Winter Sale!
            </Link>
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Unstitched Collection
            </Link>
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Winter Collection
            </Link>
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Summer Collection
            </Link>
            <button className="mobile-profile-btn" aria-label="User Profile">
            <img src={userIcon} alt="User" />
            <span>My Account</span>
          </button>
            <div className="mobile-nav-link nav-contact">
              <p>Need Help?</p>
              <p>043-2535241</p>
              <p>libaayahcontact@example.com</p>
            </div>
          </nav>

          {/* Profile Button */}
          
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </header>
  );
}
