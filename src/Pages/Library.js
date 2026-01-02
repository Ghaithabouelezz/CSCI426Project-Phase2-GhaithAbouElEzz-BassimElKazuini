import React, { useState, useEffect, useMemo } from 'react';
import '../Styles/Library.css';
import Navbar from '../Components/NavBar';
import { 
  getBooks, 
  searchBooks, 
  filterBooksByGenre,
  addToCart as addToCartAPI,
  getCartItems
} from '../services/api';
import { useNavigate } from 'react-router-dom';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('title');
  const [filterGenre, setFilterGenre] = useState('all');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await getBooks();
        setBooks(response.data);
        setSearchResults(response.data);
        
        const uniqueGenres = [...new Set(response.data.map(book => book.genre).filter(Boolean))];
        setGenres(['all', ...uniqueGenres]);
        
        console.log(`Loaded ${response.data.length} books from database`);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await getCartItems();
        setCartCount(response.data.length);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, []);

  useEffect(() => {
    const searchBooksFromDB = async () => {
      if (searchTerm.trim() === '') {
        try {
          const response = await getBooks();
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching books:', error);
        }
        return;
      }

      try {
        setSearchLoading(true);
        const response = await searchBooks(searchTerm);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchBooksFromDB();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const filterBooksFromDB = async () => {
      if (filterGenre === 'all') {
        try {
          const response = await getBooks();
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching all books:', error);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await filterBooksByGenre(filterGenre);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error filtering books:', error);
      } finally {
        setLoading(false);
      }
    };

    filterBooksFromDB();
  }, [filterGenre]);

  const filteredAndSortedBooks = useMemo(() => {
    return [...searchResults].sort((a, b) => {
      switch (sortOption) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'price-low': return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high': return parseFloat(b.price) - parseFloat(a.price);
        case 'rating': return parseFloat(b.rating) - parseFloat(a.rating);
        case 'year': return parseInt(b.published_year) - parseInt(a.published_year);
        default: return 0;
      }
    });
  }, [searchResults, sortOption]);

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
      } else {
        alert(`❌ ${response.data.error || 'Failed to add to cart'}`);
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
      
      // SIMPLIFIED: Just add to cart and navigate
      const response = await addToCartAPI(book.id);
      
      if (response.data.success) {
        // Update cart count
        setCartCount(prev => prev + 1);
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error in quick checkout:', error);
      alert(`❌ ${error.message}`);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterGenre('all');
    setSortOption('title');
  };

  if (loading && books.length === 0) {
    return (
      <>
        <Navbar cartCount={cartCount} />
        <div className="library-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'white',
            fontSize: '1.5rem',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div className="spinner"></div>
            Loading books...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar cartCount={cartCount} />
      <div className="library-container">
        <div className="animated-background"></div>
        
        <div className="library-header">
          <h1 className="library-title">Digital Library</h1>
          <p className="library-subtitle">
            Browse our collection of {books.length} books
          </p>
        </div>

        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search books, authors, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchLoading && <div className="search-loading">Searching...</div>}
          </div>

          <div className="filter-sort-container">
            <select 
              value={filterGenre} 
              onChange={(e) => setFilterGenre(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Genres</option>
              {genres.filter(genre => genre !== 'all').map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Sort by Rating</option>
              <option value="year">Sort by Year</option>
            </select>

            {(searchTerm || filterGenre !== 'all' || sortOption !== 'title') && (
              <button onClick={resetFilters} className="reset-filters-btn">
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="results-count">
          Showing {filteredAndSortedBooks.length} of {books.length} books
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        <div className="floating-cart-btn">
          <button className="cart-icon-btn" onClick={() => navigate('/cart')}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        <div className="library-content">
          <div className="books-grid-container">
            {filteredAndSortedBooks.length === 0 ? (
              <div className="no-books-found">
                <h3>📚 No books found</h3>
                <button onClick={resetFilters} className="show-all-btn">
                  Show All Books
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {filteredAndSortedBooks.map(book => (
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
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="book-genre">{book.genre || 'Unknown'}</span>
                        <span className="book-rating">⭐ {book.rating || '4.0'}</span>
                      </div>
                      <p className="book-price">${parseFloat(book.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Library;