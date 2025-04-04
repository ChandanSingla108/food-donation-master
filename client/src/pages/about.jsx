import React from "react";
import "./about.css";
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Food Rescue Network</h1>
        <p>
          Food Rescue Network is a community-driven initiative dedicated to
          reducing food waste and fighting hunger. Our mission is to connect
          surplus food from restaurants, events, and households with those in
          need. Through technology and collaboration, we ensure that perfectly
          good food reaches people instead of landfills.
        </p>
        <h2>Our Vision</h2>
        <p>
          We envision a world where no food goes to waste while people are
          struggling with hunger. Our platform bridges the gap between food
          surplus and scarcity, promoting sustainability and social impact.
        </p>
        <h2>How It Works</h2>
        <ul>
          <li>Restaurants and individuals list surplus food.</li>
          <li>NGOs and volunteers connect with donors to collect food.</li>
          <li>Food is distributed to shelters, food banks, and needy families.</li>
        </ul>
        <h2>Join Us</h2>
        <p>
          Whether you're a restaurant owner, an NGO, or a volunteer, you can be
          a part of our mission. Sign up today and help us make a difference!
        </p>
      </div>
    </div>
  );
};

export default About;
