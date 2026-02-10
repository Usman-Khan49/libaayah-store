/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  customerAccessTokenRenew,
  customerCreate,
  getCustomer,
} from "../lib/shopifyCustomer";

const AuthContext = createContext(null);

const TOKEN_KEY = "shopify_customer_token";
const TOKEN_EXPIRY_KEY = "shopify_customer_token_expiry";

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save token to localStorage
  const saveToken = (token, expiresAt) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
    setAccessToken(token);
  };

  // Clear token from localStorage
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setAccessToken(null);
    setCustomer(null);
  };

  // Check if the stored token is still valid
  const isTokenValid = () => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    return new Date(expiry) > new Date();
  };

  // Load customer data from a valid token
  const loadCustomer = useCallback(async (token) => {
    try {
      const customerData = await getCustomer(token);
      if (customerData) {
        setCustomer(customerData);
        setAccessToken(token);
        return true;
      } else {
        // Token is invalid or expired on Shopify's side
        clearToken();
        return false;
      }
    } catch (err) {
      console.error("Error loading customer:", err);
      clearToken();
      return false;
    }
  }, []);

  // Initialize — check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken || !isTokenValid()) {
          clearToken();
          setLoading(false);
          return;
        }

        // Try to renew the token if it's close to expiring (within 24 hours)
        const expiry = new Date(localStorage.getItem(TOKEN_EXPIRY_KEY));
        const hoursUntilExpiry = (expiry - new Date()) / (1000 * 60 * 60);

        if (hoursUntilExpiry < 24) {
          try {
            const renewed = await customerAccessTokenRenew(storedToken);
            if (renewed) {
              saveToken(renewed.accessToken, renewed.expiresAt);
              await loadCustomer(renewed.accessToken);
            } else {
              await loadCustomer(storedToken);
            }
          } catch {
            // Renewal failed, try with existing token
            await loadCustomer(storedToken);
          }
        } else {
          await loadCustomer(storedToken);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [loadCustomer]);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const tokenData = await customerAccessTokenCreate(email, password);
      if (!tokenData) {
        throw new Error("Invalid email or password");
      }

      saveToken(tokenData.accessToken, tokenData.expiresAt);
      await loadCustomer(tokenData.accessToken);

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (firstName, lastName, email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Create the customer account
      await customerCreate(firstName, lastName, email, password);

      // Automatically log them in after registration
      const tokenData = await customerAccessTokenCreate(email, password);
      if (tokenData) {
        saveToken(tokenData.accessToken, tokenData.expiresAt);
        await loadCustomer(tokenData.accessToken);
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (accessToken) {
        await customerAccessTokenDelete(accessToken);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      clearToken();
    }
  };

  // Refresh customer data
  const refreshCustomer = async () => {
    if (accessToken) {
      await loadCustomer(accessToken);
    }
  };

  const value = {
    customer,
    accessToken,
    isAuthenticated: !!customer && !!accessToken,
    loading,
    error,
    login,
    register,
    logout,
    refreshCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
