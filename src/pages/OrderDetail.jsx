import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrder } from "../lib/shopifyCustomer";
import { formatDateTime, formatPrice, getStatusColor } from "../utils";
import Skeleton from "../components/Skeleton";
import { Footer } from "../components/layout";
import "../styles/pages/OrderDetail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { isAuthenticated, accessToken, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setError(false);
        setLoading(true);
        const decodedId = decodeURIComponent(orderId);
        const orderData = await getCustomerOrder(accessToken, decodedId);

        if (!orderData) {
          throw new Error("Order not found");
        }

        setOrder(orderData);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, accessToken, authLoading, orderId, retryKey]);

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.zip,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (authLoading || loading) {
    return (
      <div className="order-detail-container">
        <div className="skeleton-list">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-row" />
          <Skeleton className="skeleton-row" />
          <Skeleton className="skeleton-row" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="order-detail-container">
        <div className="empty-state">
          <h2>Please Sign In</h2>
          <p>You need to be signed in to view order details.</p>
          <Link to="/login" className="back-link">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error-state">
          <h2>Error Loading Order</h2>
          <p>We could not load this order right now.</p>
          <button onClick={() => setRetryKey((prev) => prev + 1)}>
            Try Again
          </button>
          <Link to="/orders" className="back-link">
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="empty-state">
          <h2>Order Not Found</h2>
          <Link to="/orders" className="back-link">
            Back to Order History
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const lineItems = order.lineItems?.edges?.map((e) => e.node) || [];

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link to="/orders" className="back-link">
          ← Back to Orders
        </Link>
        <h1>Order {order.name || `#${order.orderNumber}`}</h1>
        <p className="order-date">Placed on {formatDateTime(order.processedAt)}</p>
      </div>

      <div className="order-detail-content">
        {/* Order Status */}
        <div className="order-section">
          <h2>Order Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Payment Status:</span>
              <span
                className={`status-badge ${getStatusColor(order.financialStatus)}`}
              >
                {order.financialStatus || "Unknown"}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Fulfillment Status:</span>
              <span
                className={`status-badge ${getStatusColor(order.fulfillmentStatus)}`}
              >
                {order.fulfillmentStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-section">
          <h2>Order Items</h2>
          <div className="order-items">
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <div key={index} className="order-item">
                  {item.variant?.image?.url && (
                    <img
                      src={
                        item.variant.image.url ||
                        item.variant.image.url_240 ||
                        item.variant.image.url_160 ||
                        item.variant.image.url_120 ||
                        item.variant.image.url_80
                      }
                      srcSet={
                        [
                          item.variant.image.url_80 &&
                            `${item.variant.image.url_80} 80w`,
                          item.variant.image.url_120 &&
                            `${item.variant.image.url_120} 120w`,
                          item.variant.image.url_160 &&
                            `${item.variant.image.url_160} 160w`,
                          item.variant.image.url &&
                            `${item.variant.image.url} 240w`,
                        ]
                          .filter(Boolean)
                          .join(", ") || undefined
                      }
                      sizes="120px"
                      alt={item.variant.image.altText || item.title}
                      className="order-item-image"
                    />
                  )}
                  <div className="item-info">
                    <h3 className="item-title">{item.title}</h3>
                    {item.variant?.title &&
                      item.variant.title !== "Default Title" && (
                        <p className="item-variant">{item.variant.title}</p>
                      )}
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.variant?.price)}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">No items in this order</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-section">
          <h2>Order Summary</h2>
          <div className="summary-grid">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotalPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatPrice(order.totalTax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="order-section">
            <h2>Shipping Address</h2>
            <div className="address-box">
              {order.shippingAddress.name && (
                <p className="address-name">{order.shippingAddress.name}</p>
              )}
              <p>{formatAddress(order.shippingAddress)}</p>
              {order.shippingAddress.phone && (
                <p className="address-phone">{order.shippingAddress.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Links */}
        {order.statusUrl && (
          <div className="order-actions">
            <a
              href={order.statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
            >
              View Order Status on Shopify
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetail;
