import React, { useState } from "react";
import { FaCalendarAlt, FaCartArrowDown, FaHome, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import "./FoodCard.css";
import vegIcon from "../assets/veg.svg";
import nonVegIcon from "../assets/non-veg.svg";

const FoodCard = ({ id, name, quantity, date, address, tag, donorName, userRole, distance }) => {
  const [statusMessage, setStatusMessage] = useState(""); 
  const [requestSent, setRequestSent] = useState(false);

  const handleCheckStatus = () => {
    if (!requestSent) {
      setStatusMessage(`✅ ${name} is Available for Pickup!`);
      setRequestSent(true);
    } else {
      setStatusMessage(`📋 Your request is being processed.`);
    }
    
    // Hide message after 5 seconds
    setTimeout(() => setStatusMessage(""), 5000);
  };

  // Format the date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

        {userRole === "needy" ? (
          <button 
            className={`food-btn ${requestSent ? 'requested' : ''}`} 
            onClick={handleCheckStatus}
          >
            {requestSent ? 'Check Request Status' : 'Request Food'}
          </button>
        ) : (
          <div className="donor-view">
            <p className="food-status-text">This food is available for recipients to request</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
