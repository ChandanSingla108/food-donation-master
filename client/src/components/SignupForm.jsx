import React, { useState } from "react";
import axios from "axios";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    role: "user" // Adding default role
  });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", isError: false });
    
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
      console.log("Signup successful", response.data);
      
      // Clear form after successful submission
      setFormData({
        name: "",
        email: "",
        password: "",
        number: "",
        role: "user"
      });
      
      // Show success message
      setMessage({ 
        text: "Registration successful! You can now log in.", 
        isError: false 
      });
      
      // Optional: Redirect to login page after successful signup
      // window.location.href = '/login';
      
    } catch (error) {
      console.error("Signup error:", error);
      
      // Extract error message from response if available
      const errorMsg = error.response?.data?.message || 
                       "Registration failed. Please try again.";
      
      setMessage({ text: errorMsg, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message.text && (
        <div style={{ 
          padding: "10px", 
          margin: "10px 0", 
          backgroundColor: message.isError ? "#ffdddd" : "#ddffdd",
          color: message.isError ? "#f44336" : "#4CAF50",
          borderRadius: "4px"
        }}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="number">Phone Number</label>
        <input
          type="tel"
          id="number"
          name="number"
          value={formData.number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="user">User</option>
          <option value="donor">Donor</option>
          <option value="recipient">Recipient</option>
        </select>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm;