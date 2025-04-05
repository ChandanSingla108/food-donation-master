import React, { useState, useEffect } from "react";
import { FaUserCircle, FaHandHoldingHeart, FaUtensils, FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardHome.css";

const DashboardHome = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState([]); // State to store food items
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    console.log("Raw localStorage user data:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user data:", parsedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // If JSON parse fails, try to save it as a string
        setUserData({ name: "User", role: "user" });
      }
    } else {
      console.warn("No user data found in localStorage");
    }
    setLoading(false);

    // Sample food data for demonstration
    const sampleFoods = [
      {
        _id: "1",
        name: "Homemade Pasta",
        quantity: "5",
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        address: "123 Main St, City",
        tag: "veg",
        donorName: "John Doe"
      },
      {
        _id: "2",
        name: "Chicken Curry",
        quantity: "3",
        date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        address: "456 Oak Ave, Town",
        tag: "non-veg",
        donorName: "Jane Smith"
      }
    ];
    
    setFoodItems(sampleFoods);
  }, []);

  // Determine which dashboard view to show based on user role
  const isDonor = userData?.role === "donor";
  
  // Add a fallback for missing name
  const userName = userData?.name || "User";

  // Handle button clicks
  const handlePrimaryAction = () => {
    if (isDonor) {
      navigate("/dashboard/donate");
    } else {
      navigate("/dashboard/nearby");
    }
  };

  const handleViewAction = () => {
    if (isDonor) {
      navigate("/dashboard/mydonations");
    } else {
      navigate("/dashboard/myrequests");
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-welcome">
        <div className="welcome-icon">
          <FaUserCircle />
        </div>
        <div className="welcome-text">
          <h1>Welcome, {userName}!</h1>
          <p>
            {isDonor
              ? "Thank you for your generosity in sharing food with those in need."
              : "Find available food donations near you and request what you need."}
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            {isDonor ? <FaHandHoldingHeart /> : <FaUtensils />}
          </div>
          <div className="stat-content">
            <h3>{isDonor ? "Your Donations" : "Available Foods"}</h3>
            <p className="stat-value">{foodItems?.length || 0}</p>
            <p className="stat-description">
              {isDonor
                ? foodItems?.length > 0 ? "Active donations available for pickup" : "You haven't made any donations yet."
                : foodItems?.length > 0 ? "Food items available near you" : "No food items currently available."}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMapMarkedAlt />
          </div>
          <div className="stat-content">
            <h3>{isDonor ? "Impact Zones" : "Nearby Locations"}</h3>
            <p className="stat-value">{foodItems?.length > 0 ? "2" : "0"}</p>
            <p className="stat-description">
              {isDonor
                ? "Areas your donations have reached."
                : "Food pickup locations near you."}
            </p>
          </div>
        </div>
      </div>

      <div className="action-section">
        <h2>{isDonor ? "Ready to Help?" : "Need Food?"}</h2>
        <div className="action-buttons">
          <button 
            className="primary-action"
            onClick={handlePrimaryAction}
          >
            {isDonor ? "Donate Food Now" : "Find Food Near Me"}
          </button>
          <button 
            className="secondary-action"
            onClick={handleViewAction}
          >
            {isDonor ? "View Your Donations" : "View Your Requests"}
          </button>
        </div>
      </div>

      <div className="dashboard-info">
        <h2>How It Works</h2>
        <div className="info-steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>
              {isDonor
                ? "Add details about the food you want to donate"
                : "Browse available food donations near you"}
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>
              {isDonor
                ? "Recipients in need will request your donation"
                : "Request the food you need with a simple click"}
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>
              {isDonor
                ? "Coordinate pickup or delivery with the recipient"
                : "Arrange pickup with the donor"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
