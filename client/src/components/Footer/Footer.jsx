import React from "react";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="heading-footer">
        Food Rescue <span>Network</span>
      </div>

      {/* Who We Are Section */}
      <div className="div1">
        <h4 className="footer-h4">Who We Are</h4>
        <a href="/about" className="footer-link">About Us</a>
        <a href="/ourwork" className="footer-link">Our Work</a>
        {/* <a href="/Vision" className="footer-link">Our Vision</a> */}
        <a href="/contact" className="footer-link">Contact</a>
      </div>

      {/* Get Involved Section */}
      <div className="div2">
        <h4 className="footer-h4">Get Involved</h4>
        <a href="/Food" className="footer-link">Request For Food</a>
        <a href="/partner" className="footer-link">Partner with Us</a>
      </div>

      {/* Social Media Section */}
      <div className="div3">
        <h4 className="footer-h4">Socials</h4>
        <div className="footer-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaInstagram size={30} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaTwitter size={30} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaFacebook size={30} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
