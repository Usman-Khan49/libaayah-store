import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useWishlist } from "../../context/WishlistContext";
import CartIcon from "../cart/CartIcon";
import logo from "../../assets/logo.png";
import user from "../../assets/user.png";
import cart from "../../assets/cart.png";
import search from "../../assets/search.png";
import { getAllProducts } from "../../lib/shopify";
import "../../styles/components/Header.css";

export default function Header() {
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await getAllProducts(20);
        // setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <header>
        <div className="main-header">
          {/* <div className="socialIcons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={instagram}
                alt="instagram icon"
                className="socialIcon"
              />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={facebook} alt="facebook icon" className="socialIcon" />
            </a>
          </div> */}
          <div className="searchBtn">
            <img src={search} alt="Search button" className="searchBtn" />
            <span>Search</span>
          </div>
          <Link to="/">
            <img src={logo} alt="Libaayah Cloth" className="logo" />
          </Link>
          <div className="utilIcon">
            <Link to="/wishlist" className="wishlist-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="wishlist-icon"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </Link>
            <img src={user} alt="user icon" className="userIcon" />
            <Link to="/cart">
              <img src={cart} alt="cart icon" className="cartBtn" />
            </Link>
          </div>
        </div>
        <div className="nav-list">
          <p className="nav-item">Lawn</p>
          <p className="nav-item">Chiffon</p>

          <Link to="/products" className="nav-item">
            New In
          </Link>
        </div>
      </header>
    </>
  );
}
