import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../lib/shopifyCustomer";
import { formatDate, formatPrice, getStatusColor } from "../utils";
import Skeleton from "../components/Skeleton";
import { Footer } from "../components/layout";
import "../styles/pages/OrderHistory.css";

const OrderHistory = () => {
  const { isAuthenticated, accessToken, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setError(false);
        setLoading(true);
        const customerOrders = await getCustomerOrders(accessToken);
        setOrders(customerOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, accessToken, authLoading, retryKey]);

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  const getStatusLabel = (status) => {
    if (!status) return "";
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (authLoading || loading) {
    return (
      <div className="orders-page">
        <div className="orders-title-section">
          <h1 className="orders-title">ORDER HISTORY</h1>
        </div>
        <div className="orders-content">
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-row" />
            ))}
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
            <p>We could not load your order history right now.</p>
            <button
              className="orders-action-btn"
              onClick={handleRetry}
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
