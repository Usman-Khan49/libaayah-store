import shopifyFetch from "./shopify";
import { API_CONFIG } from "../config";

// ========================================
// Customer Authentication
// ========================================

/**
 * Create a new customer account via the backend Admin API.
 * This avoids the activation email that the Storefront API sends.
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 * @returns {Object} customer
 */
export async function customerCreate(firstName, lastName, email, password) {
  const res = await fetch(`${API_CONFIG.serverUrl}/api/customers/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  const result = await res.json();

  if (!result.success) {
    const msg =
      result.errors?.[0]?.message || result.error || "Registration failed";
    throw new Error(msg);
  }

  return result.customer;
}

/**
 * Log in a customer and get an access token
 * @param {String} email
 * @param {String} password
 * @returns {Object} { accessToken, expiresAt }
 */
export async function customerAccessTokenCreate(email, password) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch(query, {
    input: { email, password },
  });

  if (data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
    const err = data.customerAccessTokenCreate.customerUserErrors[0];
    throw new Error(err.message);
  }

  return data?.customerAccessTokenCreate?.customerAccessToken || null;
}

/**
 * Renew a customer access token before it expires
 * @param {String} customerAccessToken
 * @returns {Object} { accessToken, expiresAt }
 */
export async function customerAccessTokenRenew(customerAccessToken) {
  const query = `
    mutation customerAccessTokenRenew($customerAccessToken: String!) {
      customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { customerAccessToken });

  if (data?.customerAccessTokenRenew?.userErrors?.length > 0) {
    throw new Error(data.customerAccessTokenRenew.userErrors[0].message);
  }

  return data?.customerAccessTokenRenew?.customerAccessToken || null;
}

/**
 * Delete (invalidate) a customer access token (logout)
 * @param {String} customerAccessToken
 * @returns {String} deletedAccessToken
 */
export async function customerAccessTokenDelete(customerAccessToken) {
  const query = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { customerAccessToken });
  return data?.customerAccessTokenDelete?.deletedAccessToken || null;
}

/**
 * Send a password reset email to the customer
 * @param {String} email
 * @returns {Boolean} success
 */
export async function customerRecover(email) {
  const query = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { email });

  if (data?.customerRecover?.customerUserErrors?.length > 0) {
    throw new Error(data.customerRecover.customerUserErrors[0].message);
  }

  return true;
}

// ========================================
// Customer Data Queries
// ========================================

/**
 * Get the currently logged-in customer's profile
 * @param {String} customerAccessToken
 * @returns {Object} customer data
 */
export async function getCustomer(customerAccessToken) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        createdAt
        defaultAddress {
          id
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        addresses(first: 10) {
          edges {
            node {
              id
              address1
              address2
              city
              province
              country
              zip
              phone
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { customerAccessToken });
  return data?.customer || null;
}

/**
 * Get customer's order history
 * @param {String} customerAccessToken
 * @param {Number} first - number of orders to fetch
 * @returns {Array} orders
 */
export async function getCustomerOrders(customerAccessToken, first = 20) {
  const query = `
    query getCustomerOrders($customerAccessToken: String!, $first: Int!) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              subtotalPrice {
                amount
                currencyCode
              }
              totalTax {
                amount
                currencyCode
              }
              currentTotalPrice {
                amount
                currencyCode
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
              shippingAddress {
                name
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              statusUrl
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { customerAccessToken, first });
  const orders = data?.customer?.orders?.edges?.map((edge) => edge.node) || [];
  return orders;
}

/**
 * Get a single order's details
 * @param {String} customerAccessToken
 * @param {String} orderId - Shopify order GID
 * @returns {Object} order
 */
export async function getCustomerOrder(customerAccessToken, orderId) {
  // The Storefront API doesn't have a single-order query,
  // so we fetch recent orders and find the matching one
  const orders = await getCustomerOrders(customerAccessToken, 50);
  return orders.find((order) => order.id === orderId) || null;
}

/**
 * Update customer profile information
 * @param {String} customerAccessToken
 * @param {Object} input - { firstName, lastName, email, phone, password }
 * @returns {Object} updated customer
 */
export async function customerUpdate(customerAccessToken, input) {
  const query = `
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          id
          firstName
          lastName
          email
          phone
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const data = await shopifyFetch(query, {
    customerAccessToken,
    customer: input,
  });

  if (data?.customerUpdate?.customerUserErrors?.length > 0) {
    throw new Error(data.customerUpdate.customerUserErrors[0].message);
  }

  return {
    customer: data?.customerUpdate?.customer || null,
    accessToken: data?.customerUpdate?.customerAccessToken || null,
  };
}
