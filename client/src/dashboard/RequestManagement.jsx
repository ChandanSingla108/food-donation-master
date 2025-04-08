import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserCircle, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaComment, 
  FaUtensils, 
  FaListAlt, 
  FaFilter, 
  FaCheckDouble,
  FaClock
} from "react-icons/fa";
import "./RequestManagement.css";

const RequestManagement = () => {
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedDonation, setExpandedDonation] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:3000/myRequests?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setDonationRequests(response.data.requests || []);
      } else {
        setError("Failed to fetch requests. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (donationId, requestId, action) => {
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setError("Authentication error. Please log in again.");
        return;
      }
      
      if (action === "complete") {
        // Show a confirmation dialog with cleanup information
        const confirmed = window.confirm(
          "Once marked as completed, this donation will be automatically removed from listings after 1 hour. Continue?"
        );
        
        if (!confirmed) {
          return;
        }
      }
      
      const response = await axios.patch(
        `http://localhost:3000/updateRequest/${donationId}`,
        {
          requestId,
          action,
          email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        if (action === "complete") {
          // Show a success message with cleanup information
          setError(""); // Clear any existing errors
          alert("Donation marked as completed! It will be automatically removed from listings after 1 hour.");
        }
        // Refresh the requests
        fetchRequests();
      } else {
        setError("Failed to update request. Please try again.");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      setError(error.response?.data?.message || "Failed to update request.");
    }
  };

  const toggleExpandDonation = (donationId) => {
    if (expandedDonation === donationId) {
      setExpandedDonation(null);
    } else {
      setExpandedDonation(donationId);
    }
  };

  const filteredRequests = donationRequests.filter(donation => {
    if (filter === "all") return true;
    if (filter === "pending") return donation.status === "available";
    if (filter === "accepted") return donation.status === "reserved";
    if (filter === "completed") return donation.status === "completed";
    return true;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading donation requests...</p>
      </div>
    );
  }

  return (
    <div className="request-management">
      <div className="request-management-header">
        <h1><FaListAlt /> Donation Requests</h1>
        <div className="filter-controls">
          <label htmlFor="request-filter"><FaFilter /> Filter:</label>
          <select 
            id="request-filter" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
          </select>
          <button className="refresh-btn" onClick={fetchRequests}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {donationRequests.length === 0 ? (
        <div className="no-requests">
          <FaUtensils />
          <h3>No requests yet</h3>
          <p>You don't have any donation requests yet. When someone requests your donated food, you'll see it here.</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="no-requests">
          <FaUtensils />
          <h3>No {filter} requests</h3>
          <p>You don't have any donations with {filter} status.</p>
        </div>
      ) : (
        <div className="request-list">
          {filteredRequests.map(donation => (
            <div className={`donation-requests-card ${donation.status}`} key={donation.donationId}>
              <div 
                className="donation-header" 
                onClick={() => toggleExpandDonation(donation.donationId)}
              >
                <div className="donation-info">
                  <h3>{donation.foodName}</h3>
                  <div className="donation-meta">
                    <span className="quantity">{donation.quantity} servings</span>
                    <span className="separator">•</span>
                    <span className="expiry">Expires: {formatDate(donation.expiryDate)}</span>
                  </div>
                  <p className="address">{donation.address}</p>
                </div>
                <div className="request-count">
                  <span className="badge">{donation.requests.length}</span>
                  <span>Requests</span>
                </div>
              </div>
              
              {expandedDonation === donation.donationId && (
                <div className="requests-container">
                  <h4 className="requests-title">
                    {donation.requests.length} {donation.requests.length === 1 ? 'Person' : 'People'} Requested This Food
                  </h4>
                  
                  <div className="request-items">
                    {donation.requests.map(request => (
                      <div className={`request-item ${request.status}`} key={request._id}>
                        <div className="requester-info">
                          <div className="requester-avatar">
                            <FaUserCircle />
                          </div>
                          <div className="requester-details">
                            <h5>{request.requesterName}</h5>
                            <div className="requester-email">
                              <FaEnvelope />
                              <span>{request.requesterEmail}</span>
                            </div>
                            <div className="request-date">
                              <FaCalendarAlt />
                              <span>Requested on {formatDate(request.requestDate)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {request.message && (
                          <div className="request-message">
                            <FaComment />
                            <p>{request.message}</p>
                          </div>
                        )}
                        
                        <div className="request-status">
                          <span className={`status-badge ${request.status}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="request-actions">
                          {donation.status === "available" && request.status === "pending" && (
                            <>
                              <button 
                                className="accept-btn"
                                onClick={() => handleRequestAction(donation.donationId, request._id, "accept")}
                              >
                                <FaCheckCircle /> Accept
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => handleRequestAction(donation.donationId, request._id, "reject")}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </>
                          )}
                          
                          {donation.status === "reserved" && request.status === "accepted" && (
                            <button 
                              className="complete-btn"
                              onClick={() => handleRequestAction(donation.donationId, request._id, "complete")}
                              title="Mark as completed and remove after 1 hour"
                            >
                              <FaCheckDouble /> Mark as Completed
                            </button>
                          )}
                          
                          {donation.status === "completed" && (
                            <div className="cleanup-notice">
                              <FaClock /> This donation will be removed from listings after 1 hour
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="donation-status">
                <span className={`status-badge ${donation.status}`}>
                  {donation.status}
                </span>
                
                {donation.status === "completed" && (
                  <span className="cleanup-badge" title="Will be removed after 1 hour">
                    <FaClock /> Auto-cleanup in 1h
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
