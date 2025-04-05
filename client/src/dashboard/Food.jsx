import React, { useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import axios from "axios";
import "./Food.css";

const Food = () => {
  const [food, setFood] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
    
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://localhost:3000/allfoods");
      console.log("Food data:", response.data);
      setFood(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setError("Failed to load food items. Please try again later.");
      setLoading(false);
    }
  };

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const filteredFood =
    selectedTag === "all"
      ? food
      : food.filter((item) => item.foodTag === selectedTag);

  const handleRefresh = () => {
    fetchFoodItems();
  };

  return (
    <div className="food-container">
      <div className="food-header">
        <h1>Available Food</h1>
        <div className="filter-controls">
          <div className="filter-section">
            <label htmlFor="tags">Filter by type:</label>
            <select
              id="tags"
              name="tags"
              value={selectedTag}
              onChange={handleTagChange}
            >
              <option value="all">All</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>
          <button onClick={handleRefresh} className="refresh-button">
            Refresh List
          </button>
        </div>
      </div>
      
      {userRole === "needy" && (
        <div className="role-message recipient">
          <p>👋 As a food recipient, you can request any available food items below.</p>
        </div>
      )}
      
      {userRole === "donor" && (
        <div className="role-message donor">
          <p>🙏 Thank you for being a donor! Here you can see all available food items, including yours.</p>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-message">Loading available food items...</div>
      ) : filteredFood.length === 0 ? (
        <div className="empty-message">
          {selectedTag === "all" 
            ? "No food items available yet. Be the first to donate!" 
            : `No ${selectedTag === "veg" ? "vegetarian" : "non-vegetarian"} food items available with selected filter.`}
        </div>
      ) : (
        <div className="food-grid">
          {filteredFood.map((item) => (
            <FoodCard
              key={item._id}
              id={item._id}
              name={item.foodName}
              quantity={item.quantity}
              date={item.expiryDate}
              address={item.address}
              tag={item.foodTag}
              donorName={item.user?.name || "Anonymous"}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Food;
