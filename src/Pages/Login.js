import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../Styles/Login.css';
import image from '../assets/image.webp';

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://bookstore-backend-production-5d76.up.railway.app/api";

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (name.trim() === "" || password.trim() === "") {
      alert("Please fill in both name and password!");
      return;
    }

    setLoading(true);

    try {
      if (hasAccount) {
        // LOGIN - Check if user exists in database
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: name, 
            password: password 
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Save user to localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          alert("Login successful!");
          navigate('/home');
        } else {
          alert(data.message || "Login failed!");
        }
      } else {
        // REGISTER - Create new user in database
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: name, 
            password: password 
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Registration successful! You can now login.");
          // Switch to login form
          setHasAccount(true);
          setName("");
          setPassword("");
        } else {
          alert(data.message || "Registration failed!");
        }
      }
    } catch (error) {
      alert("Cannot connect to server! Make sure backend is running on http://localhost:5000");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <div className="login-card">
        <h1 className="login-title">{hasAccount ? "Sign In" : "Create Account"}</h1>
        <form className="login-form" onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="Enter your username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Processing..." : (hasAccount ? "Sign In" : "Sign Up")}
          </button>
        </form>
        <p className="login-toggle">
          {hasAccount ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => {
              setHasAccount(!hasAccount);
              setName("");
              setPassword("");
            }} 
            className="login-toggle-btn"
            disabled={loading}
          >
            {hasAccount ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
