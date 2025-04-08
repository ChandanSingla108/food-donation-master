import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUtensils, 
  FaInfoCircle, 
  FaRegClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaTag,
  FaComment,
  FaClock
} from "react-icons/fa";
import "./MyRequests.css";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setError("User data not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:3000/myFoodRequests?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setRequests(response.data.requests || []);
      } else {
        setError("Failed to fetch your requests.");
      }
    } catch (error) {
      console.error("Error fetching food requests:", error);
      setError("Failed to load your requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = () => {
    if (filter === "all") return requests;
    return requests.filter(request => {
      if (filter === "pending") return request.requestStatus === "pending";
      if (filter === "accepted") return request.requestStatus === "accepted";
      if (filter === "rejected") return request.requestStatus === "rejected";
      if (filter === "completed") return request.requestStatus === "completed";
      return true;
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your food requests...</p>
      </div>
    );
  }

  return (
    <div className="my-requests-container">
      <div className="my-requests-header">
        <h1><FaUtensils /> My Food Requests</h1>
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
            onClick={() => setFilter("accepted")}
          >
            Accepted
          </button>
          <button 
            className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </button>
          <button 
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FaInfoCircle />
          <p>{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="no-requests">
          <FaInfoCircle />
          <h3>No food requests yet</h3>
          <p>You haven't requested any food donations yet. Browse available food and make a request!</p>
        </div>
      ) : filteredRequests().length === 0 ? (
        <div className="no-requests">
          <FaInfoCircle />
          <h3>No {filter} requests</h3>
          <p>You don't have any food requests with {filter} status.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests().map(request => (
            <div className={`request-card ${request.requestStatus}`} key={request.donationId}>
              <div className="request-header">
                <h3 className="food-name">{request.foodName}</h3>
                <span className={`status-badge ${request.requestStatus}`}>
                  {request.requestStatus}
                </span>
              </div>
              
              <div className="request-details">
                <div className="detail-item">
                  <FaRegClock />
                  <span>Requested on: {formatDate(request.requestDate)}</span>
                </div>
                <div className="detail-item">
                  <FaUtensils />
                  <span>Quantity: {request.quantity} servings</span>
                </div>
                <div className="detail-item">
                  <FaTag />
                  <span>Type: {request.foodTag === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                </div>
                <div className="detail-item">
                  <FaCalendarAlt />
                  <span>Expires: {formatDate(request.expiryDate)}</span>
                </div>
                <div className="detail-item address">
                  <FaMapMarkerAlt />
                  <span>{request.address}</span>
                </div>
              </div>
              
              <div className="donor-info">
                <h4>Donor Information</h4>
                <div className="detail-item">
                  <FaUser />
                  <span>{request.donorName}</span>
                </div>
                <div className="detail-item">
                  <FaEnvelope />
                  <span>{request.donorEmail}</span>
                </div>
              </div>
              
              {request.message && (
                <div className="request-message">
                  <h4><FaComment /> Your Message</h4>
                  <p>"{request.message}"</p>
                </div>
              )}
              
              <div className="request-instructions">
                {request.requestStatus === "pending" && (
                  <p className="instruction">
                    Your request is currently being reviewed by the donor. 
                    We'll notify you once there's an update.
                  </p>
                )}
                
                {request.requestStatus === "accepted" && (
                  <p className="instruction success">
                    Your request has been accepted! Please contact the donor to arrange pickup.
                  </p>
                )}
                
                {request.requestStatus === "rejected" && (
                  <p className="instruction error">
                    We're sorry, but your request was not accepted by the donor. 
                    Please try other available food donations.
                  </p>
                )}
                
                {request.requestStatus === "completed" && (
                  <p className="instruction completed">
                    <FaClock style={{ marginRight: '5px' }} /> 
                    This food donation has been successfully completed. 
                    It will be removed from listings after 1 hour. Thank you for using our service!
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

export default MyRequests;
