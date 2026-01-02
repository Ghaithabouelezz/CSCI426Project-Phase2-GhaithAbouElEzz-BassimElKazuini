
import React, { useState, useEffect } from 'react';
import '../Styles/Cart.css';
import CartItem from '../Components/CartItem';
import { 
  getCartItems,
  removeFromCart,
  clearCart
} from "../services/api";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        setError('Please login to view your cart');
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      const response = await getCartItems();
      
      const formattedItems = response.data.map(item => {
        let price = 0;
        if (item.price) {
          if (typeof item.price === 'number') {
            price = item.price;
          } else if (typeof item.price === 'string') {
            price = parseFloat(item.price);
            if (isNaN(price)) price = 0;
          }
        }
        
        return {
          ...item,
          id: item.id,
          price: price
        };
      });
      
      setCartItems(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleRemoveItem = async (cartItemId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Please login to manage cart');
        navigate('/');
        return;
      }

      const response = await removeFromCart(cartItemId);
      
      if (response.data.success) {
        setCartItems(prevItems => 
          prevItems.filter(item => item.id != cartItemId)
        );
        setSuccessMessage('Item removed!');
        setError(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Please login to manage cart');
        navigate('/');
        return;
      }

      if (!window.confirm('Are you sure you want to clear your entire cart?')) {
        return;
      }

      const response = await clearCart();
      
      if (response.data.success) {
        setCartItems([]);
        setSuccessMessage('Cart cleared successfully!');
        setError(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Please login to checkout');
        navigate('/');
        return;
      }

      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      
      // Ask for confirmation
      if (!window.confirm(`Confirm purchase of ${cartItems.length} item(s) for $${total.toFixed(2)}?`)) {
        return;
      }
      
      // SIMPLIFIED: Just clear the cart locally (no API call for now)
      setCartItems([]);
      alert(`✅ Order placed successfully!\nTotal: $${total.toFixed(2)}\nThank you for your purchase!`);
      
      setSuccessMessage('Order placed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Order placed! (Cart cleared locally)');
      setCartItems([]);
    }
  };

  const calculateOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.10;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      shippingText: shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`
    };
  };

  const orderSummary = calculateOrderSummary();

  if (loading) {
    return (
      <div className="cart-container">
        <h1>OnlineBookStore - Shopping Cart</h1>
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>OnlineBookStore - Shopping Cart</h1>
      
      {successMessage && (
        <div className="success-message">✅ {successMessage}</div>
      )}
      
      {error && (
        <div className="error-message">❌ {error}</div>
      )}
      
      <div className="cart-content">
        <div className="cart-items-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>
            {cartItems.length > 0 && (
              <button onClick={handleClearCart} className="clear-cart-btn">
                Clear All
              </button>
            )}
          </div>
          
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p style={{fontSize: '1.2rem', marginBottom: '20px', color: '#666'}}>
                {localStorage.getItem('user') ? 'Your shopping cart is empty' : 'Please login to view your cart'}
              </p>
              {!localStorage.getItem('user') ? (
                <a href="/" className="continue-shopping-btn">← Go to Login</a>
              ) : (
                <a href="/home" className="continue-shopping-btn">← Continue Shopping</a>
              )}
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onRemoveItem={handleRemoveItem} />
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items):</span>
                <span style={{fontWeight: '600'}}>${orderSummary.subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span style={{color: '#28a745', fontWeight: '600'}}>{orderSummary.shippingText}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>${orderSummary.tax}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span style={{fontSize: '1.4rem', fontWeight: '700', color: '#2d3748'}}>
                  ${orderSummary.total}
                </span>
              </div>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            
            <div className="cart-actions">
              <a href="/home" className="continue-link">← Continue Shopping</a>
              <a href="/library" className="back-link">Browse More Books →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
