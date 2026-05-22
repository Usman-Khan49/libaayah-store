const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2024-10";

const GRAPHQL_URL = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;

const normalizeQueryList = (query) =>
  Array.isArray(query) ? query.filter(Boolean) : [query].filter(Boolean);

const extractNumericId = (gid) => {
  const match = gid?.toString().match(/\/(\d+)$/);
  return match ? match[1] : null;
};

export const buildCollectionSearchQueries = (handle, collectionGid) => {
  const queries = [];
  const normalizedHandle = handle?.toString().trim();
  const numericId = extractNumericId(collectionGid);

  if (normalizedHandle) {
    queries.push(`collection_handle:${normalizedHandle}`);
    queries.push(`collection:${normalizedHandle}`);
  }

  if (numericId) {
    queries.push(`collection_id:${numericId}`);
  }

  return queries;
};

export default async function shopifyFetch(query, variables = {}) {
  if (!SHOP_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      "Shopify credentials not configured. Make sure VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN are set.",
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

export async function getProductsWithFilters(
  limit = 20,
  activeFilters = [],
  sortKey = "RELEVANCE",
  reverse = false,
  searchQuery = "*",
) {
  const query = `
    query getProducts($first: Int!, $filters: [ProductFilter!], $sortKey: SearchSortKeys, $reverse: Boolean, $query: String!) {
      search(query: $query, first: $first, productFilters: $filters, sortKey: $sortKey, reverse: $reverse, types: PRODUCT) {
        productFilters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges {
          node {
            ... on Product {
              id 
              handle 
              title 
              availableForSale
              tags
              images(first: 1) {
                edges {
                  node {
                    altText 
                    url
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
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
  const queries = normalizeQueryList(searchQuery);

  let data = null;

  for (let index = 0; index < queries.length; index += 1) {
    const variables = {
      first: limit,
      filters: activeFilters,
      sortKey,
      reverse,
      query: queries[index],
    };
    const next = await shopifyFetch(query, variables);
    const hasResults = (next?.search?.edges || []).length > 0;
    const hasFilters = (next?.search?.productFilters || []).length > 0;

    data = next;

    if (hasResults || hasFilters || index === queries.length - 1) {
      break;
    }
  }

  return {
    products: (data?.search?.edges || []).map((edge) => edge.node),
    filters: data?.search?.productFilters || [],
  };
}

const mapCollectionSortKey = (sortKey) => {
  switch (sortKey) {
    case "PRICE":
      return "PRICE";
    case "CREATED_AT":
      return "CREATED";
    case "RELEVANCE":
    default:
      return "COLLECTION_DEFAULT";
  }
};

export async function getCollectionProductsWithFilters(
  handle,
  limit = 20,
  activeFilters = [],
  sortKey = "RELEVANCE",
  reverse = false,
) {
  const query = `
    query getCollectionProducts($handle: String!, $first: Int!, $filters: [ProductFilter!], $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
      collection(handle: $handle) {
        id
        handle
        title
        products(first: $first, filters: $filters, sortKey: $sortKey, reverse: $reverse) {
          filters {
            id
            label
            type
            values {
              id
              label
              count
              input
            }
          }
          edges {
            node {
              id
              handle
              title
              availableForSale
              tags
              images(first: 1) {
                edges {
                  node {
                    altText
                    url
                  }
                }
              }
              options {
                name
                values
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
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

  const variables = {
    handle,
    first: limit,
    filters: activeFilters,
    sortKey: mapCollectionSortKey(sortKey),
    reverse,
  };

  const data = await shopifyFetch(query, variables);
  const productsConnection = data?.collection?.products;

  return {
    collection: data?.collection || null,
    products: (productsConnection?.edges || []).map((edge) => edge.node),
    filters: productsConnection?.filters || [],
  };
}

export async function getCollectionProductFilters(handle) {
  const query = `
    query getCollectionFilters($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          filters {
            id
            label
            type
            values {
              id
              label
              count
              input
            }
          }
        }
      }
    }
  `;
  const variables = { handle, first: 1 };
  const data = await shopifyFetch(query, variables);
  return data?.collection?.products?.filters || [];
}

export async function getCollections(limit = 20) {
  const query = `
    query getCollections($first: Int!) {
      collections(first: $first, sortKey: TITLE) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
    }
  `;
  const variables = { first: limit };
  const data = await shopifyFetch(query, variables);
  return (data?.collections?.edges || []).map((edge) => edge.node);
}

export async function getCollectionByHandle(handle) {
  const query = `
    query getCollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
      }
    }
  `;
  const data = await shopifyFetch(query, { handle });
  return data?.collection || null;
}

export async function getSearchProductFilters(searchQuery = "*") {
  const query = `
    query getSearchFilters($first: Int!, $query: String!) {
      search(query: $query, first: $first, types: PRODUCT) {
        productFilters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  `;
  const queries = normalizeQueryList(searchQuery);
  let lastFilters = [];

  for (let index = 0; index < queries.length; index += 1) {
    const variables = { first: 1, query: queries[index] };
    const data = await shopifyFetch(query, variables);
    const filters = data?.search?.productFilters || [];
    lastFilters = filters;

    if (filters.length > 0 || index === queries.length - 1) {
      break;
    }
  }

  return lastFilters;
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
            availableForSale
            tags
            fabricMetafield: metafield(namespace: "custom", key: "fabric") {
              value
            }
            colorMetafield: metafield(namespace: "custom", key: "color") {
              value
            }
            images(first:1){
              edges{
                node{
                  altText 
                  url
                }
              }
            }
            options {
              name
              values
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
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
