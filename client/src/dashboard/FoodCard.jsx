import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaCartArrowDown, FaHome, FaUser, FaMapMarkerAlt, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";
import axios from "axios";
import "./FoodCard.css";
import vegIcon from "../assets/veg.svg";
import nonVegIcon from "../assets/non-veg.svg";

const FoodCard = ({ id, name, quantity, date, address, tag, donorName, userRole, distance, onRequestSuccess }) => {
  const [statusMessage, setStatusMessage] = useState(""); 
  const [requestSent, setRequestSent] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // Check if this food item has already been requested by the current user
  useEffect(() => {
    const checkIfRequested = async () => {
      try {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token");
        
        if (!email || !token || userRole !== "needy") {
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
        
        if (response.data.success && response.data.requests) {
          const myRequest = response.data.requests.find(
            request => request.donationId === id
          );
          
          if (myRequest) {
            setRequestSent(true);
            setRequestStatus(myRequest.requestStatus);
          }
        }
      } catch (error) {
        console.error("Error checking request status:", error);
      }
    };
    
    checkIfRequested();
  }, [id, userRole]);

  const handleRequestClick = () => {
    if (requestSent) {
      // If already requested, show detailed status
      handleCheckStatus();
    } else {
      // Show request form
      setShowRequestForm(true);
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setStatusMessage("You must be logged in to check request status");
        setCheckingStatus(false);
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
      
      if (response.data.success && response.data.requests) {
        const myRequest = response.data.requests.find(
          request => request.donationId === id
        );
        
        if (myRequest) {
          setRequestStatus(myRequest.requestStatus);
          
          // Show appropriate message based on status
          switch(myRequest.requestStatus) {
            case "pending":
              setStatusMessage(`📋 Your request is pending approval from the donor.`);
              break;
            case "accepted":
              setStatusMessage(`✅ Your request has been accepted! Contact the donor to arrange pickup.`);
              break;
            case "rejected":
              setStatusMessage(`❌ Your request was not accepted by the donor.`);
              break;
            case "completed":
              setStatusMessage(`🎉 This food donation has been completed successfully.`);
              break;
            default:
              setStatusMessage(`📋 Your request is being processed.`);
          }
        } else {
          // If we can't find the request but thought we had one
          setStatusMessage(`✅ ${name} is Available for Pickup!`);
          setRequestSent(false);
          setRequestStatus(null);
        }
      } else {
        setStatusMessage(`✅ ${name} is Available for Pickup!`);
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setStatusMessage(`❌ Error checking request status.`);
    } finally {
      setCheckingStatus(false);
      
      // Hide message after 8 seconds
      setTimeout(() => setStatusMessage(""), 8000);
    }
  };

  const handleSubmitRequest = async () => {
    setIsRequesting(true);
    setRequestError("");
    
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");
      
      if (!email || !token) {
        setStatusMessage("You must be logged in to request food");
        setRequestError("Authentication error - please log in again");
        setIsRequesting(false);
        return;
      }
      
      const response = await axios.post(
        `http://localhost:3000/requestFood/${id}`,
        {
          email,
          message: requestMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setStatusMessage("✅ Request sent successfully! The donor will be notified.");
        setRequestSent(true);
        setRequestStatus("pending");
        setShowRequestForm(false);
        
        // Call the success callback if provided
        if (onRequestSuccess) {
          onRequestSuccess();
        }
      } else {
        setStatusMessage("❌ Failed to send request: " + response.data.message);
        setRequestError(response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error sending food request:", error);
      const errorMsg = error.response?.data?.message || "Failed to send request";
      setStatusMessage(`❌ ${errorMsg}`);
      setRequestError(errorMsg);
    } finally {
      setIsRequesting(false);
      
      // Hide message after 5 seconds
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const cancelRequest = () => {
    setShowRequestForm(false);
    setRequestMessage("");
    setRequestError("");
  };

  // Format the date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get request status icon
  const getStatusIcon = () => {
    switch(requestStatus) {
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "accepted":
        return <FaCheckCircle className="status-icon accepted" />;
      case "rejected":
        return <FaExclamationTriangle className="status-icon rejected" />;
      case "completed":
        return <FaCheckCircle className="status-icon completed" />;
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="food-title">
          <img 
            className="food-tag"
            src={tag === "veg" ? vegIcon : nonVegIcon}
            alt={tag === "veg" ? "Vegetarian" : "Non-Vegetarian"}
          />
          {name}
          {requestStatus && getStatusIcon()}
        </div>
        
        <div className="food-details">
          <ul className="icons">
            <li>
              <span className="icons-name">
                <FaCartArrowDown />
              </span>
              <span>{quantity} servings</span>
            </li>
            <li>
              <span className="icons-name">
                <FaCalendarAlt />
              </span>
              <span>Expires: {formatDate(date)}</span>
            </li>
            <li>
              <span className="icons-name">
                <FaHome />
              </span>
              <span>{address}</span>
            </li>
            <li>
              <span className="icons-name">
                <FaUser />
              </span>
              <span>Donor: {donorName}</span>
            </li>
            {distance && (
              <li className="distance-item">
                <span className="icons-name">
                  <FaMapMarkerAlt />
                </span>
                <span>{distance} km away</span>
              </li>
            )}
          </ul>
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}
        
        {requestError && (
          <div className="error-message">
            <FaInfoCircle /> {requestError}
          </div>
        )}

        {userRole === "needy" && (
          <>
            {showRequestForm ? (
              <div className="request-form">
                <textarea
                  placeholder="Add a message to the donor (optional)"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="request-message"
                  rows={3}
                ></textarea>
                <div className="request-actions">
                  <button 
                    className="cancel-request-btn" 
                    onClick={cancelRequest}
                    disabled={isRequesting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="send-request-btn" 
                    onClick={handleSubmitRequest}
                    disabled={isRequesting}
                  >
                    {isRequesting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className={`food-btn ${requestSent ? 'requested' : ''} ${requestStatus ? requestStatus : ''}`} 
                onClick={handleRequestClick}
                disabled={checkingStatus}
              >
                {checkingStatus ? 'Checking...' : 
                  requestSent ? `Check Status${requestStatus ? ` (${requestStatus})` : ''}` : 'Request Food'}
              </button>
            )}
          </>
        )}
        
        {userRole === "donor" && (
          <div className="donor-view">
            <p className="food-status-text">This food is available for recipients to request</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
