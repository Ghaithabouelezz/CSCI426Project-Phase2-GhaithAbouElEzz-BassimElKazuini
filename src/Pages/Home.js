
import React, { useState, useEffect } from "react";
import Navbar from "../Components/NavBar";
import '../Styles/Home.css';
import { 
  getBooks,
  addToCart as addToCartAPI,
  getCartItems
} from "../services/api";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await getBooks();
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setErrorMessage('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          setCartCount(0);
          return;
        }
        
        const response = await getCartItems();
        setCartCount(response.data.length);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, []);

  const addToCart = async (book) => {
    try {
      if (!book.id) {
        alert('❌ Book ID is missing');
        return;
      }
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('❌ Please login to add items to cart');
        navigate('/');
        return;
      }
      
      const response = await addToCartAPI(book.id);
      
      if (response.data.success) {
        // Update cart count locally
        setCartCount(prev => prev + 1);
        alert(`✅ Added "${book.title}" to cart!`);
        setErrorMessage('');
      } else {
        alert(`❌ ${response.data.message || response.data.error || 'Failed to add to cart'}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'User not logged in') {
        alert('❌ Please login to add items to cart');
        navigate('/');
      } else {
        alert(`❌ ${error.response?.data?.error || 'Error adding to cart'}`);
      }
    }
  };

  const quickCheckout = async (book) => {
    try {
      if (!book.id) {
        alert('❌ Book ID is missing');
        return;
      }
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('❌ Please login to checkout');
        navigate('/');
        return;
      }
      
      // SIMPLIFIED: Just add to cart and navigate to cart
      const response = await addToCartAPI(book.id);
      
      if (response.data.success) {
        // Update cart count
        setCartCount(prev => prev + 1);
        alert(`✅ "${book.title}" added to cart!`);
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error in quick checkout:', error);
      alert(`❌ ${error.message}`);
    }
  };

  // Get popular categories
  const popularCategories = ['Science Fiction', 'Fantasy', 'Mystery', 'Business', 'Thriller'];

  if (loading && books.length === 0) {
    return (
      <>
        <Navbar cartCount={cartCount} />
        <div className="home-container">
          <div className="hero-section">
            <div className="hero-content">
              <h1>Welcome to the Online Book Store</h1>
              <p>Loading books from database...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar cartCount={cartCount} />
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Welcome to the Online Book Store</h1>
            <p>Discover your next favorite book from our collection of {books.length} books</p>
          </div>
        </div>

        <div className="categories-section">
          <div className="container">
            <h2 className="section-title">Popular Categories</h2>
            
            {popularCategories.map(category => {
              const booksInCategory = books.filter(book => book.genre === category).slice(0, 5);
              
              return (
                <div key={category} className="category-row">
                  <h3 className="category-title">{category}</h3>
                  <div className="books-row">
                    {booksInCategory.map(book => (
                      <div key={book.id} className="book-card">
                        <div className="book-image-container">
                          <img 
                            src={book.image_url || `https://picsum.photos/300/400?random=${book.id}`} 
                            alt={book.title} 
                            className="book-image"
                          />
                          <div className="book-overlay">
                            <button 
                              className="add-to-cart-btn"
                              onClick={() => addToCart(book)}
                            >
                              🛒 Add to Cart
                            </button>
                            <button 
                              className="quick-checkout-btn"
                              onClick={() => quickCheckout(book)}
                            >
                              ⚡ Quick Buy
                            </button>
                          </div>
                        </div>
                        
                        <div className="book-info">
                          <h4 className="book-title">{book.title}</h4>
                          <p className="book-author">by {book.author}</p>
                          <div className="book-meta">
                            <span className="book-rating">⭐ {book.rating || '4.0'}</span>
                            <span className="book-stock" style={{
                              color: '#28a745',
                              fontSize: '0.8rem'
                            }}>
                              ✓ In Stock
                            </span>
                          </div>
                          <p className="book-price">${parseFloat(book.price || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cta-section">
          <div className="container">
            <h2>Ready to Explore More?</h2>
            <p>Discover our complete collection with {books.length} books across all genres</p>
            <button 
              className="browse-all-btn"
              onClick={() => navigate('/library')}
            >
              Browse Full Library
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
