import { useCart } from "../hooks/useCart";
import { Footer } from "../components/layout";
import "../styles/pages/CartPage.css";

export default function CartPage() {
  const { cart, updateItem, removeItem, checkout, loading } = useCart();

  const items = cart?.lines?.edges || [];

  const calculateSubtotal = () => {
    if (!cart || !items.length) return 0;
    return items.reduce((total, edge) => {
      const amount = edge?.node?.merchandise?.price?.amount;
      const quantity = edge?.node?.quantity || 0;
      if (amount) {
        return total + parseFloat(amount) * quantity;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  if (loading && !cart) {
    return (
      <div className="cart-page">
        <div className="cart-title-section">
          <h1 className="cart-title">SHOPPING CART</h1>
        </div>
        <div className="cart-content">
          <div className="empty-cart">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Page Title */}
      <div className="cart-title-section">
        <h1 className="cart-title">SHOPPING CART</h1>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items">
              {items.map((edge) => {
                const item = edge?.node;
                if (!item) return null;

                const unitPrice = item.merchandise?.price?.amount
                  ? parseFloat(item.merchandise.price.amount)
                  : 0;
                const total = unitPrice * item.quantity;

                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-details">
                      <h3 className="item-title">
                        {item.merchandise?.product?.title || "Product"}
                      </h3>
                      <div className="item-price">
                        {unitPrice.toLocaleString("en-PK")} Rs.
                      </div>
                      <p className="item-info">
                        <span className="info-label">SIZE</span> | UNSTITCHED
                      </p>
                      <p className="item-info">
                        <span className="info-label">COLOR</span> | BLACK
                      </p>
                      <div className="item-quantity">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateItem(item.id, Math.max(1, item.quantity - 1))
                          }
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem([item.id])}
                      >
                        Remove
                      </button>
                    </div>
                    <img
                      src={
                        item.merchandise?.product?.featuredImage?.url ||
                        "/placeholder.jpg"
                      }
                      alt={item.merchandise?.product?.title || "Product"}
                      className="item-image"
                    />
                  </div>
                );
              })}
            </div>

            {/* Order Summary Section */}
            <div className="order-summary">
              <h2 className="summary-title">ORDER SUMMARY</h2>

              <div className="summary-row">
                <span className="summary-label">SUBTOTAL</span>
                <span className="summary-value">
                  {subtotal.toLocaleString("en-PK")},00 Rs.
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">SHIPPING</span>
                <span className="summary-value">Free</span>
              </div>

              <div className="summary-row summary-total">
                <span className="summary-label">TOTAL</span>
                <span className="summary-value">
                  {subtotal.toLocaleString("en-PK")},00 Rs.
                </span>
              </div>

              <button
                className="checkout-btn"
                onClick={checkout}
                disabled={!cart?.checkoutUrl}
              >
                Check Out
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
