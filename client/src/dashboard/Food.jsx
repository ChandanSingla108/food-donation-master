import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUtensils, FaFilter, FaSearch, FaExclamationTriangle, FaRedoAlt } from "react-icons/fa";
import FoodCard from "./FoodCard";
import "./Food.css";

const Food = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("needy");

  useEffect(() => {
    fetchFoodItems();
    determineUserRole();
  }, []);

  const determineUserRole = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || "needy");
      }
    } catch (error) {
      console.error("Error determining user role:", error);
      setUserRole("needy");
    }
  };

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/availabledonations");
      
      if (response.data.success) {
        setFoodItems(response.data.donations);
      } else {
        setError("Failed to fetch food items");
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      setError("Error connecting to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFoodRefresh = () => {
    setLoading(true);
    fetchFoodItems();
  };

  const filteredItems = foodItems.filter(item => {
    const matchesFilter = filter === "all" || item.foodTag === filter;
    const matchesSearch = searchQuery.trim() === "" || 
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading food items...</p>
      </div>
    );
  }

  return (
    <div className="food-container">
      <div className="food-header">
        <h1><FaUtensils /> Available Food Donations</h1>
        <button className="refresh-btn" onClick={handleFoodRefresh} title="Refresh food listings">
          <FaRedoAlt /> Refresh
        </button>
      </div>

      <div className="food-controls">
        <div className="search-filter-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="filter-options">
            <span className="filter-label"><FaFilter /> Filter:</span>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button 
                className={`filter-btn veg ${filter === "veg" ? "active" : ""}`}
                onClick={() => setFilter("veg")}
              >
                Vegetarian
              </button>
              <button 
                className={`filter-btn non-veg ${filter === "non-veg" ? "active" : ""}`}
                onClick={() => setFilter("non-veg")}
              >
                Non-Vegetarian
              </button>
            </div>
          </div>
        </div>
        
        <div className="results-summary">
          {filteredItems.length > 0 ? (
            <p>Showing {filteredItems.length} of {foodItems.length} available food donations</p>
          ) : searchQuery || filter !== "all" ? (
            <p>No results match your current filters</p>
          ) : (
            <p>No food donations are available at the moment</p>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="no-food-message">
          <FaExclamationTriangle />
          <h3>No food items found</h3>
          <p>
            {searchQuery || filter !== "all" 
              ? "There are no available food donations matching your criteria. Try adjusting your filters."
              : "There are no available food donations at the moment. Please check back later."}
          </p>
          {(searchQuery || filter !== "all") && (
            <button 
              className="reset-filters-btn" 
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="food-grid">
          {filteredItems.map(item => (
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
              onRequestSuccess={handleFoodRefresh}
              elementId={`food-card-${item._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Food;
