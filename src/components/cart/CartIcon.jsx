import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import CartDrawer from "./CartDrawer";
import "../../styles/components/CartIcon.css";

export default function CartIcon() {
  const { getCartItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = getCartItemCount();

  return (
    <>
      <button
        className="cart-icon-button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open cart"
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
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
