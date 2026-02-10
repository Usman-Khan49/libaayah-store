import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Footer } from "../components/layout";
import "../styles/pages/AccountPage.css";

export default function AccountPage() {
  const { customer, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container">
          <p className="account-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const defaultAddress = customer?.defaultAddress;

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1 className="account-title">My Account</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        {/* Customer Info */}
        <section className="account-section">
          <h2 className="section-title">Profile</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">
                {customer?.firstName} {customer?.lastName}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{customer?.email}</span>
            </div>
            {customer?.phone && (
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{customer?.phone}</span>
              </div>
            )}
          </div>
        </section>

        {/* Default Address */}
        {defaultAddress && (
          <section className="account-section">
            <h2 className="section-title">Default Address</h2>
            <div className="address-box">
              <p>{defaultAddress.address1}</p>
              {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
              <p>
                {defaultAddress.city}
                {defaultAddress.province && `, ${defaultAddress.province}`}
              </p>
              <p>
                {defaultAddress.country} {defaultAddress.zip}
              </p>
              {defaultAddress.phone && <p>{defaultAddress.phone}</p>}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="account-section">
          <h2 className="section-title">Quick Links</h2>
          <div className="quick-links">
            <Link to="/orders" className="quick-link">
              Order History
              <span className="arrow">→</span>
            </Link>
            <Link to="/wishlist" className="quick-link">
              Wishlist
              <span className="arrow">→</span>
            </Link>
            <Link to="/products" className="quick-link">
              Browse Products
              <span className="arrow">→</span>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
