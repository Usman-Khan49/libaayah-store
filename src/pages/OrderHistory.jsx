import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../lib/shopifyCustomer";
import { Footer } from "../components/layout";
import "../styles/pages/OrderHistory.css";

const OrderHistory = () => {
  const { isAuthenticated, accessToken, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const customerOrders = await getCustomerOrders(accessToken);
        setOrders(customerOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, accessToken, authLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (priceObj) => {
    if (!priceObj) return "N/A";
    return `${parseFloat(priceObj.amount).toLocaleString("en-PK")} Rs.`;
  };

  const getStatusLabel = (status) => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "status-paid";
      case "PENDING":
        return "status-pending";
      case "REFUNDED":
        return "status-refunded";
      case "FULFILLED":
        return "status-fulfilled";
      default:
        return "status-default";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="orders-title-section">
          <h1 className="orders-title">ORDER HISTORY</h1>
        </div>
        <div className="orders-content">
          <div className="orders-empty">
            <p>Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="orders-title-section">
          <h1 className="orders-title">ORDER HISTORY</h1>
        </div>
        <div className="orders-content">
          <div className="orders-empty">
            <p>You need to be signed in to view your order history.</p>
            <Link to="/login" className="orders-action-btn">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-title-section">
          <h1 className="orders-title">ORDER HISTORY</h1>
        </div>
        <div className="orders-content">
          <div className="orders-empty">
            <p>{error}</p>
            <button
              className="orders-action-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-title-section">
          <h1 className="orders-title">ORDER HISTORY</h1>
        </div>
        <div className="orders-content">
          <div className="orders-empty">
            <p>You haven&apos;t placed any orders yet.</p>
            <Link to="/products" className="orders-action-btn">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Page Title */}
      <div className="orders-title-section">
        <h1 className="orders-title">ORDER HISTORY</h1>
        <p className="orders-count">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Orders List */}
      <div className="orders-content">
        <div className="orders-list">
          {orders.map((order) => {
            const lineItems = order.lineItems?.edges?.map((e) => e.node) || [];

            return (
              <Link
                key={order.id}
                to={`/orders/${encodeURIComponent(order.id)}`}
                className="order-row"
              >
                <div className="order-row-left">
                  <h3 className="order-name">
                    {order.name || `#${order.orderNumber}`}
                  </h3>
                  <p className="order-date">{formatDate(order.processedAt)}</p>
                  {lineItems.length > 0 && (
                    <p className="order-items-count">
                      {lineItems.length} item
                      {lineItems.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="order-row-center">
                  {order.financialStatus && (
                    <span
                      className={`order-status ${getStatusColor(order.financialStatus)}`}
                    >
                      {getStatusLabel(order.financialStatus)}
                    </span>
                  )}
                  {order.fulfillmentStatus && (
                    <span
                      className={`order-status ${getStatusColor(order.fulfillmentStatus)}`}
                    >
                      {getStatusLabel(order.fulfillmentStatus)}
                    </span>
                  )}
                </div>

                <div className="order-row-right">
                  <span className="order-total">
                    {formatPrice(order.totalPrice)}
                  </span>
                  <span className="order-view-link">View Details →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
