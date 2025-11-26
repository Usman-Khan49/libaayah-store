import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import "../styles/pages/OrderHistory.css";

const OrderHistory = () => {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const response = await fetch(`${serverUrl}/api/orders/${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isLoaded]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  if (!isLoaded || loading) {
    return (
      <div className="order-history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="order-history-container">
        <div className="empty-state">
          <h2>Please Sign In</h2>
          <p>You need to be signed in to view your order history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-state">
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-container">
        <div className="empty-state">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Order History</h1>
        <p className="order-count">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="order-card"
          >
            <div className="order-card-header">
              <div className="order-info">
                <h3 className="order-number">
                  {order.name || `#${order.orderNumber}`}
                </h3>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <div className="order-total">
                {formatPrice(order.totalPrice, order.currency)}
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-items-preview">
                {order.lineItems && order.lineItems.length > 0 && (
                  <p className="items-count">
                    {order.lineItems.length} item
                    {order.lineItems.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="order-statuses">
                {order.financialStatus && (
                  <span
                    className={`status-badge ${getStatusColor(
                      order.financialStatus
                    )}`}
                  >
                    {order.financialStatus}
                  </span>
                )}
                {order.fulfillmentStatus && (
                  <span
                    className={`status-badge ${getStatusColor(
                      order.fulfillmentStatus
                    )}`}
                  >
                    {order.fulfillmentStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="order-card-footer">
              <span className="view-details">View Details →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
