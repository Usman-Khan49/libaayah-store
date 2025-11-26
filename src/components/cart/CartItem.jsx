import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { Link } from "react-router-dom";
import "../../styles/components/CartItem.css";

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const merchandise = item.merchandise;
  const product = merchandise.product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || isUpdating) return;

    try {
      setIsUpdating(true);
      await updateItem(item.id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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

  const lineTotal = {
    amount: (parseFloat(merchandise.price.amount) * item.quantity).toFixed(2),
    currencyCode: merchandise.price.currencyCode,
  };

  return (
    <div className={`cart-item ${isRemoving ? "removing" : ""}`}>
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

      <div className="cart-item-details">
        <div className="cart-item-info">
          <Link to={`/product/${product.handle}`} className="cart-item-title">
            {product.title}
          </Link>
          {merchandise.title !== "Default Title" && (
            <p className="cart-item-variant">{merchandise.title}</p>
          )}
          <p className="cart-item-price">{formatPrice(merchandise.price)}</p>
        </div>

        <div className="cart-item-actions">
          <div className="quantity-selector">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="quantity">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="remove-button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label="Remove item"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>

        <div className="cart-item-total">{formatPrice(lineTotal)}</div>
      </div>
    </div>
  );
}
