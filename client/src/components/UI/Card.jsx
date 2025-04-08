import React from "react";
import "./Card.css";

const Card = ({ name, des, img }) => {
  return (
    <div className="partner-card">
      <div className="card-image-container">
        <img src={img} alt={`${name} logo`} />
      </div>
      <div className="card-content">
        <h2 className="card-heading">{name}</h2>
        <p className="card-description">{des}</p>
        <div className="card-action">
          <button className="btn-card">Donate Now</button>
        </div>
      </div>
    </div>
  );
};

export default Card;
