import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FoodDonation.css";

function FoodDonation() {
  const [foodName, setFoodName] = useState("");
  const [foodTag, setFoodTag] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [address, setAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Reset messages
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);
    
    // Form validation
    if (!foodName || !foodTag || !quantity || !expiryDate || !address) {
      setErrorMessage("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const formData = {
      foodName,
      foodTag,
      quantity: Number(quantity),
      expiryDate,
      address,
      email,
    };

    try {
      const response = await axios.post("http://localhost:3000/fooddonation", {
        formData,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Donation response:", response.data);

      // Show success message
      setSuccessMessage(`Thanks for donating ${foodName}! Your donation has been registered successfully.`);

      // Clear form fields after successful submission
      setFoodName("");
      setFoodTag("");
      setQuantity("");
      setExpiryDate("");
      setAddress("");

      // Redirect to the food listings page after a delay
      setTimeout(() => {
        navigate("/dashboard/food");
      }, 3000);
    } catch (error) {
      console.error("Donation error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="foodDonation_container">
      <div className="foodDonation_heading">
        <h1 className="heading-foodd">FOOD DONATION FORM</h1>
      </div>

      {/* Show success message if available */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Show error message if available */}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="foodDonation_wrapper">
        <form className="food-donation_form" onSubmit={handleSubmit}>
          <div className="form_element">
            <label htmlFor="foodName">Food Name</label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              placeholder="Enter food name"
              required
            />
          </div>

          <div className="form_element">
            <label htmlFor="quantity">Quantity (servings)</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Number of servings"
              min="1"
              required 
            />
          </div>

          <div className="form_element">
            <label htmlFor="foodTag">Food Type</label>
            <select
              id="foodTag"
              name="foodTag"
              value={foodTag}
              onChange={(event) => setFoodTag(event.target.value)}
              required
            >
              <option value="" disabled>
                Choose type
              </option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="form_element">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={expiryDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) => setExpiryDate(event.target.value)}
              required
            />
          </div>

          <div className="form_element">
            <label htmlFor="address">Pickup Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter pickup address"
              required
            />
          </div>

          <button 
            id="foodDonation_submit-btn" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Donate Food"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FoodDonation;
