import { useCart } from "../hooks/useCart";
import { Footer } from "../components/layout";
import "../styles/pages/CartPage.css";

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();

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
          <h1 className="cart-title">Shopping cart</h1>
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
        <h1 className="cart-title">Shopping cart</h1>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart Table Header */}
            <div className="cart-table-header">
              <div className="header-product">PRODUCT</div>
              <div className="header-price">PRICE</div>
              <div className="header-quantity">QUANTITY</div>
              <div className="header-total">TOTAL</div>
            </div>

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
                    <div className="item-product">
                      <img
                        src={
                          item.merchandise?.product?.featuredImage?.url ||
                          "/placeholder.jpg"
                        }
                        alt={item.merchandise?.product?.title || "Product"}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h3 className="item-title">
                          {item.merchandise?.product?.title || "Product"}
                        </h3>
                        <p className="item-variant">
                          {item.merchandise?.title !== "Default Title"
                            ? item.merchandise?.title
                            : ""}
                        </p>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem([item.id])}
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    <div className="item-price">
                      Rs. {unitPrice.toLocaleString("en-PK")}
                    </div>

                    <div className="item-quantity">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateItem(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      Rs. {total.toLocaleString("en-PK")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Note and Checkout Section */}
            <div className="cart-footer">
              <div className="order-note-section">
                <label htmlFor="orderNote" className="note-label">
                  Add Order Note
                </label>
                <textarea
                  id="orderNote"
                  placeholder="How can we help you?"
                  className="order-note-input"
                  rows="3"
                />
              </div>

              <div className="checkout-section">
                <div className="subtotal-row">
                  <span className="subtotal-label">SUBTOTAL:</span>
                  <span className="subtotal-amount">
                    RS. {subtotal.toLocaleString("en-PK")}
                  </span>
                </div>

                <div className="payment-info">
                  <button className="payment-option">
                    Pay in 3 installments of Rs.{" "}
                    {(subtotal / 3).toLocaleString("en-PK")}
                  </button>
                </div>

                <p className="shipping-note">
                  All charges are billed in PKR. While the content of your cart
                  is currently displayed in PKR, the checkout will use PKR at
                  the most current exchange rate.
                </p>

                <button className="checkout-btn">Check Out</button>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              <h3 className="coupon-title">Coupon</h3>
              <p className="coupon-subtitle">
                Coupon code will work on checkout page
              </p>
              <input
                type="text"
                placeholder="Coupon code"
                className="coupon-input"
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
