import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: parseInt(id), quantity })
    })
      .then(res => res.json())
      .then(() => {
        setMessage('Item added to your cart!');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(err => console.error('Error adding to cart:', err));
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const averageRating = product?.reviews?.length 
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="loading">Product not found</div>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to products</Link>

      {message && <div className="success-message">✓ {message}</div>}

      <div className="product-detail">
        <div className="product-detail-header">
          <div className="product-detail-image-container">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-detail-image"
            />
          </div>
          <div className="product-detail-info">
            <p className="product-detail-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>

            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <button className="btn btn-primary" onClick={addToCart}>
              Add to Cart
            </button>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Customer Reviews ({product.reviews ? product.reviews.length : 0}) — {averageRating} ★</h2>
          {product.reviews && product.reviews.map(review => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <span className="username">{review.username}</span>
                <span className="stars">{renderStars(review.rating)}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
