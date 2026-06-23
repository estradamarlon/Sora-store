import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    fetch(`${API_URL}/api/cart`)
      .then(res => res.json())
      .then(data => {
        setCartItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cart:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    fetch(`${API_URL}/api/cart/${cartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    })
      .then(() => fetchCart())
      .catch(err => console.error('Error updating cart:', err));
  };

  const removeItem = (cartId) => {
    fetch(`${API_URL}/api/cart/${cartId}`, { method: 'DELETE' })
      .then(() => fetchCart())
      .catch(err => console.error('Error removing item:', err));
  };

  const totalCost = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="emoji">🛒</div>
          <p>Your cart is empty</p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              Subtotal
              <span>${totalCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/" className="btn" style={{ background: '#f1f5f9', color: '#475569' }}>
                Continue Shopping
              </Link>
              <button className="btn btn-primary">
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
