import React, { useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import axios from "axios";
import "./Food.css";

const Food = () => {
  const [food, setFood] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/allfoods");
      setFood(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
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

  return (
    <div className="food-container">
      <div className="food-header">
        <h1>Food Available</h1>
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
      </div>
      
      {loading ? (
        <div className="loading-message">Loading available food items...</div>
      ) : filteredFood.length === 0 ? (
        <div className="empty-message">No food items available with selected filter.</div>
      ) : (
        <div className="food-grid">
          {filteredFood.map((item) => (
            <FoodCard
              key={item._id}
              name={item.foodName}
              quantity={item.quantity}
              date={item.expiryDate}
              address={item.address}
              tag={item.foodTag}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Food;
