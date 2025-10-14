import "./ProductCard.css";

const ProductCard = ({ product }) => {
  if (!product) {
    return (
      <div className="product-card loading">
        <div className="product-image-placeholder">Loading...</div>
        <div className="product-info">
          <h3>Loading product...</h3>
        </div>
      </div>
    );
  }

  const firstImage = product.images?.edges?.[0]?.node;
  const firstVariant = product.variants?.edges?.[0]?.node;
  const price = firstVariant?.priceV2;
  const comparePrice = firstVariant?.compareAtPriceV2;

  return (
    <div className="product-card">
      <div className="product-image">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.altText || product.title}
            loading="lazy"
          />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        {product.description && (
          <p className="product-description">
            {product.description.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>
        )}

        <div className="product-price">
          {price && (
            <>
              <span className="current-price">
                {price.currencyCode} {price.amount}
              </span>
              {comparePrice &&
                parseFloat(comparePrice.amount) > parseFloat(price.amount) && (
                  <span className="compare-price">
                    {comparePrice.currencyCode} {comparePrice.amount}
                  </span>
                )}
            </>
          )}
        </div>

        <div className="product-availability">
          {firstVariant?.availableForSale ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
