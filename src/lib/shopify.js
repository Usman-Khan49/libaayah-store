const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2024-10";

const GRAPHQL_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;

export default async function shopifyFetch(query, variables = {}) {
  if (!SHOP_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      "Shopify credentials not configured. Make sure VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN are set."
    );
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error("HTTP error: " + response.status);
  }
  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  return result.data;
}

export async function getFirstProduct() {
  const query = `
  query getProduct {
    products(first:4){
    edges{
      node{
        id
        title
        images(first:5){
          edges{
            node{
              url
              altText
              }
            }
          }
        variants(first:1){
          edges{
            node{
              price{
                amount 
                currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
  `;
  const data = await shopifyFetch(query);

  return data?.products?.edges?.[0]?.node || null;
}

export async function getAllProducts(limit = 20) {
  const query = `
    query getAllProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id 
            handle 
            title 
            images(first:1){
              edges{
                node{
                  altText 
                  url
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const variables = { first: limit };
  const data = await shopifyFetch(query, variables);
  return (data?.products?.edges || []).map((edge) => edge.node);
}

export async function getProduct(handle) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle 
        title
        description
        tags 
        availableForSale
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id 
              title 
              sku
              availableForSale
              price {
                amount 
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name 
                value
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { handle });
  return data?.product || null;
}

export async function getProductsByCollection(handle, limit = 20) {
  const query = `
    query getProductsByCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        handle 
        title
        products(first: $first) {
          edges {
            node {
              handle 
              id 
              title 
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              featuredImage {
                url 
                altText
                width 
                height
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { handle, first: limit });
  return data.collection?.products.edges.map((edge) => edge.node) || [];
}
export async function getSearchProducts(limit, queryText) {
  const query = `
    query searchProducts($first: Int!, $q: String!) {
      search(first: $first, query: $q) {
        edges {
          node {
            ... on Product {
              id 
              handle
              title
              tags
              availableForSale
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { first: limit, q: queryText });
  return (data?.search?.edges || [])
    .map((e) => e.node)
    .filter((n) => n && n.handle);
}
