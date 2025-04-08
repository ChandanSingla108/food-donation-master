import React, { useState, useEffect } from "react";
import { FaUserCircle, FaHandHoldingHeart, FaUtensils, FaMapMarkedAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DashboardHome.css";

const DashboardHome = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    impactZones: 0,
    availableFood: 0
  });
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
        
        // After setting user data, fetch their donations
        fetchUserDonations();
      } catch (error) {
        console.error("Error parsing user data:", error);
        // If JSON parse fails, try to save it as a string
        setUserData({ name: "User", role: "user" });
        setLoading(false);
      }
    } else {
      console.warn("No user data found in localStorage");
      setLoading(false);
    }
  }, []);
  
  // Fetch user donations to get accurate stats
  const fetchUserDonations = async () => {
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        console.warn("Missing email or token");
        setLoading(false);
        return;
      }
      
      // Fetch user donations
      const response = await axios.get(
        `http://localhost:3000/mydonations?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.donations) {
        // Count total donations
        const totalDonations = response.data.donations.length;
        
        // Calculate unique impact zones (locations)
        const uniqueLocations = new Set();
        response.data.donations.forEach(donation => {
          if (donation.address) {
            // Extract city or area from address for impact zone calculation
            const addressParts = donation.address.split(',');
            if (addressParts.length > 1) {
              // Use the second-to-last part as the area/city
              uniqueLocations.add(addressParts[addressParts.length - 2].trim());
            } else {
              uniqueLocations.add(donation.address.trim());
            }
          }
        });
        
        // Get count of available food items
        const availableFoodResponse = await axios.get("http://localhost:3000/availabledonations");
        const availableFood = availableFoodResponse.data?.donations?.length || 0;
        
        // Update donation stats
        setDonationStats({
          totalDonations,
          impactZones: uniqueLocations.size,
          availableFood
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user donations:", error);
      setLoading(false);
    }
  };

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
            <p className="stat-value">
              {isDonor ? donationStats.totalDonations : donationStats.availableFood}
            </p>
            <p className="stat-description">
              {isDonor
                ? donationStats.totalDonations > 0 ? "Active donations available for pickup" : "You haven't made any donations yet."
                : donationStats.availableFood > 0 ? "Food items available near you" : "No food items currently available."}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMapMarkedAlt />
          </div>
          <div className="stat-content">
            <h3>{isDonor ? "Impact Zones" : "Nearby Locations"}</h3>
            <p className="stat-value">
              {isDonor ? donationStats.impactZones : donationStats.availableFood > 0 ? "Available" : "0"}
            </p>
            <p className="stat-description">
              {isDonor
                ? donationStats.impactZones > 0 
                  ? `Your donations have reached ${donationStats.impactZones} area${donationStats.impactZones > 1 ? 's' : ''}.` 
                  : "Start donating to make an impact."
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
