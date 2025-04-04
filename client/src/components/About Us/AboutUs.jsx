import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="aboutus">
      <div className="info-text">
        <h1 className="info-heading">Food Rescue Network</h1>
        <p className="info-subheading">
          Food Rescue Network is a platform dedicated to reducing food waste 
          by connecting surplus food from restaurants, events, and households to those in need. 
          <br></br>
          <br></br>
          Our mission is to ensure that no edible food goes to waste while helping communities 
          fight hunger. Through efficient tracking and a streamlined donation process, 
          we make food redistribution simple, effective, and impactful.
        </p>
      </div>
      <div className="info-img"></div>
    </div>
  );
};

export default AboutUs;
