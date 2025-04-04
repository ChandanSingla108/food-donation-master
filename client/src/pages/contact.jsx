import React from "react";
import "./contact.css";
const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you! Whether you have questions, feedback, or
          want to collaborate, feel free to reach out.
        </p>
        <h2>Get in Touch</h2>
        <p>
          <strong>Email:</strong> support@foodrescuenetwork.org
        </p>
        <p>
          <strong>Phone:</strong> +91 8307300824
        </p>
        <p>
          <strong>Address:</strong> 123 Food Rescue Street, Sustainability City,
          Earth
        </p>
        <h2>Follow Us</h2>
        <ul>
          <li><a href="#">Facebook</a></li>
          <li><a href="#">Twitter</a></li>
          <li><a href="#">Instagram</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Contact;
