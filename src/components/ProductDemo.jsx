import { useState, useEffect } from "react";
import { getFirstProduct } from "../utils/shopify";
import ProductCard from "../components/ProductCard";

const ProductDemo = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching product from Shopify...");

        const productData = await getFirstProduct();
        console.log("Product data:", productData);

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (error) {
    return (
      <div className="product-demo">
        <h2 className="demo-title">Product Demo</h2>
        <div className="error-message">Error loading product: {error}</div>
      </div>
    );
  }

  return (
    <div className="product-demo">
      <h2 className="demo-title">Product Demo</h2>
      {loading ? (
        <ProductCard product={null} />
      ) : (
        <ProductCard product={product} />
      )}
    </div>
  );
};

export default ProductDemo;
