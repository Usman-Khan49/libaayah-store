import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import CartIcon from "../cart/CartIcon";
import logo from "../../assets/logo.png";
import user from "../../assets/user.png";
import cart from "../../assets/cart.png";
import search from "../../assets/search.png";
import { getAllProducts } from "../../lib/shopify";
import "../../styles/components/Header.css";

export default function Header() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts(20);
        setProducts(data);
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
          <img src={logo} alt="Libaayah Cloth" className="logo" />
          <div className="nav-list">
            <p className="nav-item">Lawn</p>
            <p className="nav-item">Chiffon</p>

            <p className="nav-item">New In</p>
          </div>
          <div className="utilIcon">
            <div className="searchBtn">
              <img src={search} alt="Search button" className="searchBtn" />
            </div>
            <img src={user} alt="user icon" className="userIcon" />
            <img src={cart} alt="cart icon" className="cartBtn" />
          </div>
        </div>
      </header>
    </>
  );
}
