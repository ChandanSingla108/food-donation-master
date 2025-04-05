import React, { useState } from "react";
import { FaCalendarAlt, FaCartArrowDown, FaHome, FaUser } from "react-icons/fa";
import "./FoodCard.css";
import vegIcon from "../assets/veg.svg";
import nonVegIcon from "../assets/non-veg.svg";

const FoodCard = ({ id, name, quantity, date, address, tag, donorName }) => {
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
          </ul>
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <button 
          className={`food-btn ${requestSent ? 'requested' : ''}`} 
          onClick={handleCheckStatus}
        >
          {requestSent ? 'Check Request Status' : 'Request Food'}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
