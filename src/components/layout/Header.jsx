import { Link } from "react-router-dom";
import { useState } from "react";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import CartDrawer from "../cart/CartDrawer";
import "../../styles/components/Header.css";
import logoImg from "../../assets/Logo.png";
import userIcon from "../../assets/user.png";
import heartIcon from "../../assets/heart.png";
import cartIcon from "../../assets/cart.png";

export default function Header() {
  const { getWishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const wishlistCount = getWishlistCount();
  const cartCount = getCartItemCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);
  const [mobileSummerOpen, setMobileSummerOpen] = useState(false);
  const [mobileWinterOpen, setMobileWinterOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
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

        {/* Left Section - Navigation Links */}
        <nav className="header-left desktop-only">
          <div 
            className="nav-item-wrapper"
            onMouseEnter={() => setCollectionOpen(true)}
            onMouseLeave={() => setCollectionOpen(false)}
          >
            <Link to="/products" className="nav-link">
              Collection
            </Link>
            
            {/* Mega Dropdown Menu */}
            <div className={`mega-menu ${collectionOpen ? 'open' : ''}`}>
              <div className="mega-menu-content">
                {/* Column 1: Featured Image */}
                <div className="mega-menu-image">
                  <img src="/src/assets/img36.jpg" alt="Collection" />
                </div>
                
                {/* Column 2: Summer */}
                <div className="mega-menu-column">
                  <Link to="/products?category=summer" className="mega-menu-title">
                    Summer
                  </Link>
                  <ul className="mega-menu-list">
                    <li><Link to="/products?category=summer&fabric=lawn">Lawn</Link></li>
                    <li><Link to="/products?category=summer&fabric=linen">Linen</Link></li>
                    <li><Link to="/products?category=summer&fabric=cotton">Cotton</Link></li>
                  </ul>
                </div>
                
                {/* Column 3: Winter */}
                <div className="mega-menu-column">
                  <Link to="/products?category=winter" className="mega-menu-title">
                    Winter
                  </Link>
                  <ul className="mega-menu-list">
                    <li><Link to="/products?category=winter&fabric=khaddar">Khaddar</Link></li>
                    <li><Link to="/products?category=winter&fabric=karandi">Karandi</Link></li>
                    <li><Link to="/products?category=winter&fabric=velvet">Velvet</Link></li>
                  </ul>
                </div>
                
                {/* Column 4: New Arrivals */}
                <div className="mega-menu-column">
                  <Link to="/products?sort=new" className="mega-menu-title">
                    New Arrivals
                  </Link>
                </div>
                
                {/* Column 5: Shop All */}
                <div className="mega-menu-column">
                  <Link to="/products" className="mega-menu-title">
                    Shop All
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <Link to="/products?sale=true" className="nav-link sale">
            Sale
          </Link>
        </nav>

        {/* Center Section - Logo Only */}
        <div className="header-center">
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="Libaayah" className="logo-img" />
          </Link>
        </div>

        {/* Right Section */}
        <div className="header-right">
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="icon-btn"
            aria-label="User Profile"
          >
            <img src={userIcon} alt="User" />
          </Link>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <img src={heartIcon} alt="Wishlist" />
            {wishlistCount > 0 && (
              <span className="icon-badge">{wishlistCount}</span>
            )}
          </Link>
          <button 
            className="icon-btn" 
            aria-label="Shopping Bag"
            onClick={() => setCartOpen(true)}
          >
            <img src={cartIcon} alt="Cart" />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </button>
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
            {/* Collection with Dropdown */}
            <div className="mobile-nav-item">
              <div 
                className="mobile-nav-link with-dropdown"
                onClick={() => setMobileCollectionOpen(!mobileCollectionOpen)}
              >
                <span>Collection</span>
                <span className={`dropdown-arrow ${mobileCollectionOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {/* Subcategories Dropdown */}
              <div className={`mobile-dropdown ${mobileCollectionOpen ? 'open' : ''}`}>
                {/* Summer with nested dropdown */}
                <div className="mobile-dropdown-section">
                  <div 
                    className="mobile-dropdown-title with-dropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileSummerOpen(!mobileSummerOpen);
                    }}
                  >
                    <span>Summer</span>
                    <span className={`dropdown-arrow ${mobileSummerOpen ? 'open' : ''}`}>▼</span>
                  </div>
                  <div className={`mobile-nested-dropdown ${mobileSummerOpen ? 'open' : ''}`}>
                    <Link to="/products?category=summer&fabric=lawn" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Lawn
                    </Link>
                    <Link to="/products?category=summer&fabric=linen" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Linen
                    </Link>
                    <Link to="/products?category=summer&fabric=cotton" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Cotton
                    </Link>
                  </div>
                </div>
                
                {/* Winter with nested dropdown */}
                <div className="mobile-dropdown-section">
                  <div 
                    className="mobile-dropdown-title with-dropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileWinterOpen(!mobileWinterOpen);
                    }}
                  >
                    <span>Winter</span>
                    <span className={`dropdown-arrow ${mobileWinterOpen ? 'open' : ''}`}>▼</span>
                  </div>
                  <div className={`mobile-nested-dropdown ${mobileWinterOpen ? 'open' : ''}`}>
                    <Link to="/products?category=winter&fabric=khaddar" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Khaddar
                    </Link>
                    <Link to="/products?category=winter&fabric=karandi" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Karandi
                    </Link>
                    <Link to="/products?category=winter&fabric=velvet" className="mobile-dropdown-link" onClick={toggleMenu}>
                      Velvet
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* New Arrivals Link */}
            <Link
              to="/products?sort=new"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              New Arrivals
            </Link>
            
            {/* Shop All Link */}
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Shop All
            </Link>
            
            {/* Sale Link */}
            <Link
              to="/products?sale=true"
              className="mobile-nav-link sale"
              onClick={toggleMenu}
            >
              Sale
            </Link>
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              className="mobile-profile-btn"
              onClick={toggleMenu}
            >
              <img src={userIcon} alt="User" />
              <span>{isAuthenticated ? "My Account" : "Sign In"}</span>
            </Link>
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
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
