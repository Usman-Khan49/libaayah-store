import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/pages/OrderDetail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const response = await fetch(
          `${serverUrl}/api/orders/${user.id}/${orderId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Order not found");
          } else if (response.status === 403) {
            throw new Error("You don't have permission to view this order");
          }
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, isLoaded, orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price, currency = "USD") => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(price));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "status-paid";
      case "pending":
        return "status-pending";
      case "refunded":
        return "status-refunded";
      case "fulfilled":
        return "status-fulfilled";
      default:
        return "status-default";
    }
  };

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

  if (!isLoaded || loading) {
    return (
      <div className="order-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="order-detail-container">
        <div className="empty-state">
          <h2>Please Sign In</h2>
          <p>You need to be signed in to view order details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error-state">
          <h2>Error Loading Order</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/orders")}>Back to Orders</button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link to="/orders" className="back-link">
          ← Back to Orders
        </Link>
        <h1>Order {order.name || `#${order.orderNumber}`}</h1>
        <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="order-detail-content">
        {/* Order Status */}
        <div className="order-section">
          <h2>Order Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Payment Status:</span>
              <span
                className={`status-badge ${getStatusColor(
                  order.financialStatus
                )}`}
              >
                {order.financialStatus || "Unknown"}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Fulfillment Status:</span>
              <span
                className={`status-badge ${getStatusColor(
                  order.fulfillmentStatus
                )}`}
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
            {order.lineItems && order.lineItems.length > 0 ? (
              order.lineItems.map((item, index) => (
                <div key={item.id || index} className="order-item">
                  <div className="item-info">
                    <h3 className="item-title">{item.title}</h3>
                    {item.variantTitle &&
                      item.variantTitle !== "Default Title" && (
                        <p className="item-variant">{item.variantTitle}</p>
                      )}
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.price, order.currency)}
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
              <span>{formatPrice(order.subtotalPrice, order.currency)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatPrice(order.totalTax, order.currency)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(order.totalPrice, order.currency)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="order-section">
          <h2>Customer Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span>{order.email || order.customer?.email || "N/A"}</span>
            </div>
            {order.customer && (
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span>
                  {order.customer.firstName} {order.customer.lastName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping & Billing */}
        <div className="addresses-section">
          <div className="order-section">
            <h2>Shipping Address</h2>
            <div className="address-box">
              {order.shippingAddress ? (
                <>
                  {order.shippingAddress.name && (
                    <p className="address-name">{order.shippingAddress.name}</p>
                  )}
                  <p>{formatAddress(order.shippingAddress)}</p>
                  {order.shippingAddress.phone && (
                    <p className="address-phone">
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
          </div>

          <div className="order-section">
            <h2>Billing Address</h2>
            <div className="address-box">
              {order.billingAddress ? (
                <>
                  {order.billingAddress.name && (
                    <p className="address-name">{order.billingAddress.name}</p>
                  )}
                  <p>{formatAddress(order.billingAddress)}</p>
                  {order.billingAddress.phone && (
                    <p className="address-phone">
                      {order.billingAddress.phone}
                    </p>
                  )}
                </>
              ) : (
                <p>No billing address provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Links */}
        {order.orderStatusUrl && (
          <div className="order-actions">
            <a
              href={order.orderStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
            >
              View Order Status on Shopify
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
