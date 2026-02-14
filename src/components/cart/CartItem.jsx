import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { Link } from "react-router-dom";
import "../../styles/components/CartItem.css";

export default function CartItem({ item }) {
  const { updateItem, removeItem, updatingLineId } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const merchandise = item.merchandise;
  const product = merchandise.product;
  const isUpdating = updatingLineId === item.id;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || updatingLineId) return;
    await updateItem(item.id, newQuantity);
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      await removeItem([item.id]);
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={`cart-item ${isRemoving ? "removing" : ""}`}>
      <div className="cart-item-image-container">
        <Link to={`/product/${product.handle}`} className="cart-item-image">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
            />
          ) : (
            <div className="no-image">No image</div>
          )}
        </Link>
        {isUpdating && (
          <div className="cart-item-loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <div className="cart-item-details">
        <Link to={`/product/${product.handle}`} className="cart-item-title">
          {product.title}
        </Link>
        <p className="cart-item-price">{formatPrice(merchandise.price)}</p>
        <p className="cart-item-category">Unstitched</p>
        
        <div className="cart-item-actions">
          <div className="quantity-selector">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={!!updatingLineId || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="quantity">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={!!updatingLineId}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="remove-button"
            onClick={handleRemove}
            disabled={isRemoving || !!updatingLineId}
            aria-label="Remove item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
