import React from "react";
import "./Vision.css";

const Vision = () => {
  return (
    <div className="vision">
      <div className="vision-img"></div>
      <div className="vision-text">
        <h1 className="info-heading">Our Vision</h1>
        <p className="vision-subheading">
          At Food Rescue Network, we envision a world where surplus food is never wasted 
          but instead reaches those in need. Our goal is to create a sustainable and efficient 
          food distribution system that connects donors with communities facing food insecurity.
          <br></br>
          <br></br> By leveraging technology and community-driven initiatives, we strive to 
          bridge the gap between excess food and hunger, ensuring that every meal finds a 
          purpose.
        </p>
      </div>
    </div>
  );
};

export default Vision;
