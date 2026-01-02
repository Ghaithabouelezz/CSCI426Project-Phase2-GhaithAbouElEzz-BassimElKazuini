import React from 'react';
import '../Styles/CartItem.css';

const CartItem = ({ item, onRemoveItem }) => {
  // Parse price safely
  const parsePrice = (price) => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  const unitPrice = parsePrice(item.price);
  
  const handleRemove = () => {
    if (window.confirm(`Remove "${item.title}" from cart?`)) {
      onRemoveItem(item.id);
    }
  };

  return (
    <div className="cart-item">
      <div className="item-image">
        <img 
          src={item.image_url || 'https://picsum.photos/120/160'} 
          alt={item.title} 
          onError={(e) => {
            e.target.src = 'https://picsum.photos/120/160';
          }}
        />
      </div>
      
      <div className="item-details">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-author">by {item.author}</p>
        <p className="item-category">{item.genre || 'Fiction'}</p>
        
        <div className="item-rating">
          <span className="rating-stars">{"★".repeat(Math.floor(item.rating || 4))}</span>
          <span className="rating-value">{item.rating || 4.0}</span>
        </div>
      </div>
      
      <div className="item-price">
        <p className="price">${unitPrice.toFixed(2)}</p>
        <button onClick={handleRemove} className="remove-btn">
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;