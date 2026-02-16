/**
 * Format a Shopify price object for display.
 * @param {Object} priceObj - Shopify price object { amount, currencyCode }
 * @returns {string} Formatted currency string, e.g. "Rs 2,500.00"
 */
export const formatPrice = (priceObj) => {
  if (!priceObj) return "N/A";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: priceObj.currencyCode || "PKR",
  }).format(parseFloat(priceObj.amount));
};

/**
 * Format date string
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date and time string
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Map order status to a CSS class name
 * @param {string} status - Order status (PAID, PENDING, REFUNDED, FULFILLED, etc.)
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
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
