import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    const { email, password } = formData;
    
    try {
      const res = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      
      console.log("Login response data:", res.data); // Debug the response structure
      
      if (res.data && res.data.token) {
        // Check for user data in different possible response structures
        const userData = res.data.existingUser || res.data.user || {};
        
        if (!userData._id) {
          console.warn("Warning: User data is missing ID", userData);
        }
        
        // Ensure phone number is properly stored
        if (userData.number && !userData.phone) {
          userData.phone = userData.number;
        } else if (userData.phone && !userData.number) {
          userData.number = userData.phone;
        }
        
        // Save user data to localStorage with full object
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", email);
        // Force a full refresh to make sure localStorage changes are applied
        window.dispatchEvent(new Event('storage'));

        if (userData && userData.role) {
          const roleMessage = userData.role === 'donor' 
            ? "Welcome back, Donor! Ready to help others?" 
            : "Welcome! Let's find some food for you today.";
          
          alert(roleMessage);
        } else {
          alert("Login successful!");
        }

        navigate("/dashboard");
      } else {
        setErrorMessage("User data not found in server response. Please try again.");
        console.error("Unexpected response structure:", res.data);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_container">
      <div className="login_wrapper">
        <form onSubmit={handleSubmit}>
          <h1 className="login__heading">Login</h1>
          <p>If you are already a member, easily log in</p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <input
            type="text"
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
            placeholder="Enter password"
            id="password"
            required
          />
          <a href="#">Forgot my password</a>

          <button className="main__button" type="submit" id="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="or">
            <hr />
            OR
            <hr />
          </div>
          <div className="register">
            <p>If you don't have an account</p>
            <Link to={"/signup"}>
              <button className="register-btn">Register</button>
            </Link>
          </div>
        </form>
      </div>

      <div className="login_main-img"></div>
    </div>
  );
};

export default Login;
