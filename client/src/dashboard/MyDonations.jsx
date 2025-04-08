import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUtensils, FaEdit, FaTrash, FaInfoCircle, FaMapMarkedAlt } from "react-icons/fa";
import FoodCard from "./FoodCard";
import "./MyDonations.css";

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [stats, setStats] = useState({
    totalDonations: 0,
    impactZones: 0
  });

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      // Get email from localStorage instead of user ID
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setError("User data not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:3000/mydonations?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("My donations:", response.data);
      
      if (response.data && Array.isArray(response.data.donations)) {
        const donationData = response.data.donations;
        setDonations(donationData);
        
        // Calculate statistics
        const uniqueLocations = new Set();
        donationData.forEach(donation => {
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
        
        setStats({
          totalDonations: donationData.length,
          impactZones: uniqueLocations.size
        });
      } else {
        setDonations([]);
        setStats({ totalDonations: 0, impactZones: 0 });
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Failed to load your donations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `http://localhost:3000/donations/${donationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the list after deletion
      setDonations(donations.filter(donation => donation._id !== donationId));
      
      // Update stats after deletion
      setStats(prevStats => ({
        ...prevStats,
        totalDonations: prevStats.totalDonations - 1
      }));
      
      // We should recalculate impact zones here, but for simplicity,
      // we'll just refresh the entire list
      fetchMyDonations();
    } catch (error) {
      console.error("Error deleting donation:", error);
      alert("Failed to delete donation. Please try again.");
    }
  };

  const filteredDonations = () => {
    if (filter === "all") return donations;
    return donations.filter(donation => donation.status === filter);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaInfoCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="my-donations-container">
      <div className="my-donations-header">
        <h1><FaUtensils /> My Donations</h1>
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === "available" ? "active" : ""}`}
            onClick={() => setFilter("available")}
          >
            Available
          </button>
          <button 
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>
      
      {/* Donation Statistics Summary */}
      <div className="donation-stats-summary">
        <div className="stats-card">
          <h3>Total Donations</h3>
          <p className="stat-number">{stats.totalDonations}</p>
        </div>
        <div className="stats-card">
          <h3>Impact Zones</h3>
          <div className="impact-zone-content">
            <FaMapMarkedAlt className="impact-icon" />
            <p className="stat-number">{stats.impactZones}</p>
          </div>
          <p className="stat-description">
            {stats.impactZones > 0 
              ? `Your donations have reached ${stats.impactZones} area${stats.impactZones > 1 ? 's' : ''}` 
              : "Start donating to make an impact"}
          </p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="no-donations">
          <FaInfoCircle />
          <h3>No donations yet</h3>
          <p>You haven't made any food donations yet. Start sharing your extra food with those in need!</p>
        </div>
      ) : filteredDonations().length === 0 ? (
        <div className="no-donations">
          <FaInfoCircle />
          <h3>No {filter} donations</h3>
          <p>You don't have any donations with {filter} status.</p>
        </div>
      ) : (
        <div className="donations-grid">
          {filteredDonations().map(donation => (
            <div className="donation-card-container" key={donation._id}>
              <FoodCard
                id={donation._id}
                name={donation.foodName}
                quantity={donation.quantity}
                date={donation.expiryDate}
                address={donation.address}
                tag={donation.foodTag}
                donorName={donation.donorName || "You"}
                userRole="donor"
              />
              <div className="donation-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => {/* Implement edit functionality */}}
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteDonation(donation._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
              <div className="donation-status">
                <span className={`status-badge ${donation.status}`}>
                  {donation.status}
                </span>
                {donation.status === "reserved" && (
                  <p className="reservation-info">
                    Reserved by: {donation.reservedBy?.name || "Someone"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDonations;
