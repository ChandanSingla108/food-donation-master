import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    role: "donor", // Default role is donor
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const data = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      number: formData.number,
      role: formData.role,
    };

    try {
      const response = await axios.post("http://localhost:3000/signup", data);
      
      if (response.data && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.newUser || response.data.user));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("email", data.email);
        
        window.dispatchEvent(new Event('storage'));
        
        alert("Signup successful! Welcome to Food Donation.");
        
        navigate("/dashboard");
      } else {
        setError("Signup successful but received unexpected response. Please try logging in.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup_container">
      <div className="signup_main-img"></div>

      <div className="signup_wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Sign-Up</h1>
          <p>Create your free account on Food-donation</p>
          
          {error && <div className="error-alert">{error}</div>}

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            id="name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            id="email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            id="password"
            required
          />
          <input
            type="tel"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Enter your phone number"
            id="phone"
            required
          />

          <div className="role-selection">
            <label className="role-label">I want to:</label>
            <div className="role-options">
              <label className={`role-option ${formData.role === 'donor' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="donor"
                  checked={formData.role === 'donor'}
                  onChange={handleChange}
                />
                <span className="role-icon">🤲</span>
                <span className="role-text">Donate Food</span>
              </label>
              
              <label className={`role-option ${formData.role === 'needy' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="needy"
                  checked={formData.role === 'needy'}
                  onChange={handleChange}
                />
                <span className="role-icon">🍽️</span>
                <span className="role-text">Receive Food</span>
              </label>
            </div>
          </div>

          <button type="submit" id="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="login">
            <p>Already have an account?</p>
            <Link to={"/login"}>
              <button className="login-btn">Login</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
