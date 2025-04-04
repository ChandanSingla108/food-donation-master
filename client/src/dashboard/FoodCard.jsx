import React, { useState } from "react";
import { FaCalendarAlt, FaCartArrowDown, FaHome } from "react-icons/fa";
import "./FoodCard.css";
import vegIcon from "../assets/veg.svg";
import nonVegIcon from "../assets/non-veg.svg";

const FoodCard = ({ name, quantity, date, address, tag }) => {
  const [statusMessage, setStatusMessage] = useState(""); // State for status message

  const handleCheckStatus = () => {
    setStatusMessage(`✅ Status: ${name} is Available for Pickup! 🥗🚀`);
    setTimeout(() => setStatusMessage(""), 5000); // Hide message after 5 seconds
  };

  return (
    <div>
      <div className="card">
       { /* Veg/Non-Veg Tag with SVG */}
         

        <div className="card-content">
          <div className="food-title">
          
          <img className="food-tag"
            src={tag === "veg" ? vegIcon : nonVegIcon}
            alt={tag}
            style={{ width: "30px", height: "30px" }}
          />
        {name}</div>
          <div className="food-details">
            <ul className="icons">
              <li>
                <span className="icons-name">
                  <FaCartArrowDown />
                </span>
                : {quantity} servings
              </li>
              <li>
                <span className="icons-name">
                  <FaCalendarAlt />
                </span>
                : {new Date(date).toLocaleDateString("en-GB")}
              </li>
              <li>
                <span className="icons-name">
                  <FaHome />
                </span>
                : {address}
              </li>
            </ul>
          </div>

          {/* Status Message */}
          {statusMessage && <div className="status-message">{statusMessage}</div>}

          <button className="food-btn" onClick={handleCheckStatus}>
            Check Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
