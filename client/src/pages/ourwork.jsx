import React from "react";
import "./ourwork.css";

const Ourwork = () => {
  return (
    <div className="ourwork-container">
      <div className="ourwork-content">
        <h1>Our Work</h1>
        <p>
          At <span className="highlight">Food Rescue Network</span>, we are committed to reducing food waste and ensuring surplus food reaches those in need. Our initiatives focus on:
        </p>
        
        <ul>
          <li><strong>Food Collection:</strong> Partnering with restaurants, events, and households to collect surplus food.</li>
          <li><strong>Distribution:</strong> Working with local NGOs and shelters to distribute meals to the needy.</li>
          <li><strong>Awareness Campaigns:</strong> Educating communities on the importance of food sustainability.</li>
          <li><strong>Volunteer Programs:</strong> Encouraging individuals to join us in making a difference.</li>
        </ul>

        <p>
          Together, we can create a world with **less food waste and more full plates**. Join us in our mission!
        </p>
      </div>
    </div>
  );
};

export default Ourwork;
