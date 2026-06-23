import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discover Our Products</h1>
        <p className="page-subtitle">Curated collection of premium items for your lifestyle</p>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <Link to={`/product/${product.id}`} className="product-card" key={product.id}>
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-card-image"
              loading="lazy"
            />
            <div className="product-card-body">
              <p className="product-card-category">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
