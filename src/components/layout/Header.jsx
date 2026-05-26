import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getCollections,
  getSearchProductFilters,
  getCollectionProductFilters,
  buildCollectionSearchQueries,
} from "../../lib/shopify";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import CartDrawer from "../cart/CartDrawer";
import "../../styles/components/Header.css";
import logoImg from "../../assets/logo.png";
import collectionImg from "../../assets/img36.jpg";
import userIcon from "../../assets/user.png";
import heartIcon from "../../assets/heart.png";
import cartIcon from "../../assets/cart.png";

const parseFilterInput = (input) => {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

const normalizeValue = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getFabricValues = (filters) => {
  const fabricFilter = filters.find((filter) => {
    if (normalizeValue(filter.label)?.includes("fabric")) return true;
    return (filter.values || []).some((val) => {
      const parsed = parseFilterInput(val.input);
      return parsed?.productMetafield?.key === "fabric";
    });
  });

  const values = fabricFilter?.values || [];
  return [...values].sort((a, b) => a.label.localeCompare(b.label));
};

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
  const [collections, setCollections] = useState([]);
  const [collectionFacets, setCollectionFacets] = useState({});
  const [mobileSectionOpen, setMobileSectionOpen] = useState({});

  const saleCollection = collections.find(
    (collection) => collection.handle === "sale",
  );
  const visibleCollections = collections.filter(
    (collection) => collection.handle !== "sale",
  );
  const pinnedHandles = ["summer", "winter"];
  const pinnedCollections = pinnedHandles
    .map((handle) => visibleCollections.find((item) => item.handle === handle))
    .filter(Boolean);
  const otherCollections = visibleCollections.filter(
    (collection) => !pinnedHandles.includes(collection.handle),
  );
  const menuCollections = pinnedCollections.length
    ? [...pinnedCollections, ...otherCollections]
    : visibleCollections;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getCollections(20);
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const scopedCollections = collections.filter(
      (collection) => collection.handle !== "sale",
    );

    if (scopedCollections.length === 0) {
      setCollectionFacets({});
      return () => {
        cancelled = true;
      };
    }

    const fetchCollectionFilters = async () => {
      try {
        const entries = await Promise.all(
          scopedCollections.map(async (collection) => {
            let filters = await getCollectionProductFilters(collection.handle);

            if (!filters.length) {
              const fallbackQueries = buildCollectionSearchQueries(
                collection.handle,
                collection.id,
              );
              filters = await getSearchProductFilters(fallbackQueries);
            }

            const fabricValues = getFabricValues(filters);
            return [collection.handle, fabricValues];
          }),
        );

        if (!cancelled) {
          setCollectionFacets(Object.fromEntries(entries));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching collection filters:", error);
        }
      }
    };

    fetchCollectionFilters();

    return () => {
      cancelled = true;
    };
  }, [collections]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleMobileSection = (handle) => {
    setMobileSectionOpen((prev) => ({
      ...prev,
      [handle]: !prev[handle],
    }));
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
            <div className={`mega-menu ${collectionOpen ? "open" : ""}`}>
              <div className="mega-menu-content">
                {/* Column 1: Featured Image */}
                <div className="mega-menu-image">
                  <img
                    src={collectionImg}
                    alt="Collection"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {menuCollections.map((collection) => {
                  const fabricValues =
                    collectionFacets[collection.handle] || [];

                  return (
                    <div key={collection.id} className="mega-menu-column">
                      <Link
                        to={`/products?collection=${collection.handle}`}
                        className="mega-menu-title"
                      >
                        {collection.title}
                      </Link>
                      <ul className="mega-menu-list">
                        {fabricValues.length > 0 ? (
                          fabricValues.map((value) => (
                            <li key={value.id}>
                              <Link
                                to={`/products?collection=${collection.handle}&fabric=${encodeURIComponent(value.label)}`}
                              >
                                {value.label}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>No fabrics yet</li>
                        )}
                      </ul>
                    </div>
                  );
                })}

                {/* Shop All */}
                <div className="mega-menu-column">
                  <Link to="/products" className="mega-menu-title">
                    Shop All
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {saleCollection && (
            <Link
              to={`/products?collection=${saleCollection.handle}`}
              className="nav-link sale"
            >
              {saleCollection.title}
            </Link>
          )}
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
            <img src={userIcon} alt="User" loading="lazy" decoding="async" />
          </Link>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            <img
              src={heartIcon}
              alt="Wishlist"
              loading="lazy"
              decoding="async"
            />
            {wishlistCount > 0 && (
              <span className="icon-badge">{wishlistCount}</span>
            )}
          </Link>
          <button
            className="icon-btn"
            aria-label="Shopping Bag"
            onClick={() => setCartOpen(true)}
          >
            <img src={cartIcon} alt="Cart" loading="lazy" decoding="async" />
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
                <span
                  className={`dropdown-arrow ${mobileCollectionOpen ? "open" : ""}`}
                >
                  ▼
                </span>
              </div>

              {/* Subcategories Dropdown */}
              <div
                className={`mobile-dropdown ${mobileCollectionOpen ? "open" : ""}`}
              >
                {menuCollections.map((collection) => {
                  const fabricValues =
                    collectionFacets[collection.handle] || [];
                  const sectionOpen = mobileSectionOpen[collection.handle];

                  return (
                    <div
                      key={collection.id}
                      className="mobile-dropdown-section"
                    >
                      <div
                        className="mobile-dropdown-title with-dropdown"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleMobileSection(collection.handle);
                        }}
                      >
                        <span>{collection.title}</span>
                        <span
                          className={`dropdown-arrow ${sectionOpen ? "open" : ""}`}
                        >
                          ▼
                        </span>
                      </div>
                      <div
                        className={`mobile-nested-dropdown ${sectionOpen ? "open" : ""}`}
                      >
                        <Link
                          to={`/products?collection=${collection.handle}`}
                          className="mobile-dropdown-link"
                          onClick={toggleMenu}
                        >
                          All {collection.title}
                        </Link>
                        {fabricValues.length > 0 ? (
                          fabricValues.map((value) => (
                            <Link
                              key={value.id}
                              to={`/products?collection=${collection.handle}&fabric=${encodeURIComponent(value.label)}`}
                              className="mobile-dropdown-link"
                              onClick={toggleMenu}
                            >
                              {value.label}
                            </Link>
                          ))
                        ) : (
                          <span className="mobile-dropdown-link">
                            No fabrics yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {visibleCollections.length === 0 && (
                  <span className="mobile-dropdown-link">
                    No collections yet
                  </span>
                )}
              </div>
            </div>

            {/* Shop All Link */}
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={toggleMenu}
            >
              Shop All
            </Link>

            {/* Sale Link */}
            {saleCollection && (
              <Link
                to={`/products?collection=${saleCollection.handle}`}
                className="mobile-nav-link sale"
                onClick={toggleMenu}
              >
                {saleCollection.title}
              </Link>
            )}
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              className="mobile-profile-btn"
              onClick={toggleMenu}
            >
              <img src={userIcon} alt="User" loading="lazy" decoding="async" />
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
