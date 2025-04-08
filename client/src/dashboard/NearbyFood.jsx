import React, { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa";
import ReceiverDashboard from "./ReceiverDashboard";
import "./NearbyFood.css";

// This component acts as a wrapper for ReceiverDashboard with proper lifecycle management
const NearbyFood = () => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Set a small delay before rendering the map component
    // This helps with the initialization process
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);
    
    // Clean up function to handle unmounting properly
    return () => {
      clearTimeout(timer);
      setShouldRender(false);
      
      // Clean up any Leaflet remnants
      document.querySelectorAll('.leaflet-container').forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Remove any other Leaflet elements
      document.querySelectorAll('.leaflet-pane').forEach(el => el.remove());
      document.querySelectorAll('.leaflet-control-container').forEach(el => el.remove());
      document.querySelectorAll('.leaflet-marker-icon').forEach(el => el.remove());
      document.querySelectorAll('.leaflet-marker-shadow').forEach(el => el.remove());
      
      // Force a manual garbage collection if possible
      if (window.gc) {
        window.gc();
      }
    };
  }, []);
  
  if (!shouldRender) {
    return (
      <div className="nearby-food-loading">
        <div className="loading-spinner"></div>
        <h2><FaUtensils /> Loading Food Map</h2>
        <p>Preparing to show nearby food donations...</p>
      </div>
    );
  }
  
  return (
    <div className="nearby-food-wrapper">
      <ReceiverDashboard key={`receiver-dashboard-${Date.now()}`} />
    </div>
  );
};

export default NearbyFood;
