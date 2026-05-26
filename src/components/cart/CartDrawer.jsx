import { useEffect } from "react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils";
import Skeleton from "../Skeleton";
import CartItem from "./CartItem";
import "../../styles/components/CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, loading, getCartSubtotal, updatingLineId, checkout } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const subtotal = getCartSubtotal();
  const cartLines = cart?.lines?.edges || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""} ${updatingLineId ? "updating" : ""}`}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="cart-loading">
            <div className="skeleton-list" style={{ width: "100%" }}>
              <Skeleton className="skeleton-row" />
              <Skeleton className="skeleton-row" />
              <Skeleton className="skeleton-row" />
            </div>
          </div>
        ) : cartLines.length === 0 ? (
          <div className="cart-empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button className="continue-shopping" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartLines.map((edge) => (
                <CartItem key={edge.node.id} item={edge.node} />
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <span className="subtotal-amount">{formatPrice(subtotal)}</span>
              </div>
              <p className="cart-note">
                Shipping and taxes calculated at checkout
              </p>
              <button
                className="checkout-button"
                type="button"
                onClick={checkout}
              >
                Proceed to Checkout
              </button>
              <button className="continue-shopping-link" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
