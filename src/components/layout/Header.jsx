import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import CartIcon from "../cart/CartIcon";
import "../../styles/components/Header.css";

export default function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Libaayah Store</h1>
        </Link>

        <nav className="main-nav">
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <SignedIn>
            <Link to="/orders" className="nav-link">
              My Orders
            </Link>
          </SignedIn>
        </nav>

        <div className="header-actions">
          <CartIcon />

          <SignedOut>
            <SignInButton mode="modal">
              <button className="sign-in-btn">Sign In</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
