import shopifyFetch from "./shopify";

export async function createCart(lines = []) {
  console.log("createCart called with lines:", lines);
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price{
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      featuredImage {
                        url_120: url(
                          transform: {
                            maxWidth: 120
                            maxHeight: 160
                            preferredContentType: WEBP
                          }
                        )
                        url_180: url(
                          transform: {
                            maxWidth: 180
                            maxHeight: 240
                            preferredContentType: WEBP
                          }
                        )
                        url: url(
                          transform: {
                            maxWidth: 240
                            maxHeight: 320
                            preferredContentType: WEBP
                          }
                        )
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, {
    input: { lines },
  });

  console.log("createCart response:", data);

  if (data?.cartCreate?.userErrors?.length > 0) {
    console.error("createCart userErrors:", data.cartCreate.userErrors);
    throw new Error(data.cartCreate.userErrors[0].message);
  }

  console.log("createCart successful, cart:", data?.cartCreate?.cart);
  return data?.cartCreate?.cart || null;
}

/**
 * Add items to an existing cart
 * @param {String} cartId - Shopify cart ID
 * @param {Array} lines - Array of { merchandiseId, quantity }
 * @returns {Object} Updated cart object
 */
export async function addToCart(cartId, lines) {
  console.log("addToCart called with:", { cartId, lines });
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      featuredImage {
                        url_120: url(
                          transform: {
                            maxWidth: 120
                            maxHeight: 160
                            preferredContentType: WEBP
                          }
                        )
                        url_180: url(
                          transform: {
                            maxWidth: 180
                            maxHeight: 240
                            preferredContentType: WEBP
                          }
                        )
                        url: url(
                          transform: {
                            maxWidth: 240
                            maxHeight: 320
                            preferredContentType: WEBP
                          }
                        )
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId, lines });

  console.log("addToCart response:", data);

  if (data?.cartLinesAdd?.userErrors?.length > 0) {
    console.error("addToCart userErrors:", data.cartLinesAdd.userErrors);
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }

  console.log("addToCart successful, cart:", data?.cartLinesAdd?.cart);
  return data?.cartLinesAdd?.cart || null;
}

/**
 * Update cart line quantity
 * @param {String} cartId - Shopify cart ID
 * @param {String} lineId - Cart line ID
 * @param {Number} quantity - New quantity
 * @returns {Object} Updated cart object
 */
export async function updateCartLine(cartId, lineId, quantity) {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      featuredImage {
                        url_120: url(
                          transform: {
                            maxWidth: 120
                            maxHeight: 160
                            preferredContentType: WEBP
                          }
                        )
                        url_180: url(
                          transform: {
                            maxWidth: 180
                            maxHeight: 240
                            preferredContentType: WEBP
                          }
                        )
                        url: url(
                          transform: {
                            maxWidth: 240
                            maxHeight: 320
                            preferredContentType: WEBP
                          }
                        )
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  if (data?.cartLinesUpdate?.userErrors?.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }

  return data?.cartLinesUpdate?.cart || null;
}

/**
 * Remove items from cart
 * @param {String} cartId - Shopify cart ID
 * @param {Array} lineIds - Array of line IDs to remove
 * @returns {Object} Updated cart object
 */
export async function removeFromCart(cartId, lineIds) {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId, lineIds });

  if (data?.cartLinesRemove?.userErrors?.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }

  return data?.cartLinesRemove?.cart || null;
}

/**
 * Get cart by ID
 * @param {String} cartId - Shopify cart ID
 * @returns {Object} Cart object or null if not found
 */
export async function getCart(cartId) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        createdAt
        updatedAt
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id 
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title 
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { cartId });

  return data?.cart || null;
}
