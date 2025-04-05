import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUtensils, FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaSearchLocation, FaCrosshairs, FaTimes } from "react-icons/fa";
import FoodCard from "./FoodCard";
import "./DonateForm.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map location selection
const LocationPicker = ({ position, setPosition, setAddress }) => {
  const markerRef = useRef(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // Reverse geocode to get address
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    },
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  return position ? (
    <Marker 
      position={position} 
      ref={markerRef}
      draggable={true}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const newPos = marker.getLatLng();
            setPosition(newPos);
            reverseGeocode(newPos.lat, newPos.lng);
          }
        },
      }}
    />
  ) : null;
};

const DonateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    address: "",
    tag: "veg"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Location dialog state
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India
  const [mapZoom, setMapZoom] = useState(5);

  // Get user data for preview
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = userData.name || "Anonymous";

  // Open location selection dialog
  const openLocationDialog = () => {
    setShowLocationDialog(true);
  };

  // Close location dialog
  const closeLocationDialog = () => {
    setShowLocationDialog(false);
  };

  // Search for locations
  const searchLocations = async (query) => {
    if (!query || query.length < 3) return;
    
    setSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      setLocationSuggestions(response.data);
    } catch (error) {
      console.error("Error searching locations:", error);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchLocation(value);
    
    // Debounce search
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      searchLocations(value);
    }, 500);
  };

  // Select location from suggestions
  const selectLocation = (location) => {
    if (location && location.lat && location.lon) {
      const position = { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
      setMapPosition(position);
      setMapCenter([position.lat, position.lng]);
      setMapZoom(16);
      setFormData({
        ...formData,
        address: location.display_name
      });
    }
  };

  // Detect current location
  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { lat: latitude, lng: longitude };
          
          setMapPosition(newPosition);
          setMapCenter([latitude, longitude]);
          setMapZoom(16);
          
          // Reverse geocode to get address
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Could not get your current location. Please try searching or clicking on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (response.data && response.data.display_name) {
        setFormData({
          ...formData,
          address: response.data.display_name
        });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Set address from map selection
  const setAddressFromMap = (address) => {
    setFormData({
      ...formData,
      address
    });
  };

  // Confirm location selection
  const confirmLocation = () => {
    closeLocationDialog();
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!formData.name.trim() || !formData.quantity || !formData.date || !formData.address.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Get user data from localStorage
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if (!email || !token) {
        setError("You must be logged in to donate food");
        setLoading(false);
        return;
      }

      // Log the data we're sending for debugging
      console.log("Sending donation data:", {
        ...formData,
        email,
        donorName: userData.name,
        location: mapPosition ? {
          type: "Point",
          coordinates: [mapPosition.lng, mapPosition.lat]
        } : undefined
      });

      // Send data to server with email instead of userId
      const response = await axios.post(
        "http://localhost:3000/donateFood",
        {
          ...formData,
          email, // Use email instead of userId
          donorName: userData.name,
          location: mapPosition ? {
            type: "Point",
            coordinates: [mapPosition.lng, mapPosition.lat]
          } : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Donation response:", response.data);
      
      if (response.data.success) {
        setSuccess(true);
        
        // Clear form
        setFormData({
          name: "",
          quantity: "",
          date: new Date().toISOString().split("T")[0],
          address: "",
          tag: "veg"
        });
        setMapPosition(null);

        // Automatically navigate back to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to donate food");
      }
    } catch (err) {
      console.error("Error donating food:", err);
      if (err.response) {
        console.error("Server response:", err.response.data);
        setError(err.response.data.message || "Failed to donate food. Please try again.");
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error submitting form. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-form-container">
      <div className="donate-header">
        <h1>Donate Food</h1>
        <p className="donate-intro">Share your excess food with those in need</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Food donation submitted successfully! Thank you for your generosity.
        </div>
      )}

      <div className="form-preview-container">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="donate-form">
            <div className="form-group">
              <label htmlFor="name">
                <FaUtensils /> Food Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Homemade Pasta, Rice and Curry"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                <FaClipboardList /> Quantity (servings)
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Number of servings"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">
                <FaCalendarAlt /> Best Before Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt /> Pickup Address
              </label>
              <div className="address-input-group">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Select location from map"
                  required
                  readOnly
                />
                <button 
                  type="button" 
                  className="location-dialog-btn"
                  onClick={openLocationDialog}
                >
                  <FaSearchLocation /> Select Location
                </button>
              </div>
            </div>

            <div className="form-group food-type-group">
              <label>Food Type</label>
              <div className="food-type-options">
                <label className={`food-type-option ${formData.tag === "veg" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="tag"
                    value="veg"
                    checked={formData.tag === "veg"}
                    onChange={handleChange}
                  />
                  <span className="food-type-indicator veg"></span>
                  <span>Vegetarian</span>
                </label>
                <label className={`food-type-option ${formData.tag === "non-veg" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="tag"
                    value="non-veg"
                    checked={formData.tag === "non-veg"}
                    onChange={handleChange}
                  />
                  <span className="food-type-indicator non-veg"></span>
                  <span>Non-Vegetarian</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="preview-btn"
                onClick={togglePreview}
              >
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? "Submitting..." : "Donate Now"}
              </button>
            </div>
          </form>
        </div>

        {showPreview && (
          <div className="preview-container">
            <h3>Donation Preview</h3>
            <FoodCard
              name={formData.name || "Food Name"}
              quantity={formData.quantity || "0"}
              date={formData.date || new Date().toISOString()}
              address={formData.address || "Your Address"}
              tag={formData.tag}
              donorName={userName}
              userRole="donor"
            />
          </div>
        )}
      </div>

      {/* Location Selection Dialog with Map */}
      {showLocationDialog && (
        <div className="location-dialog-overlay">
          <div className="location-dialog">
            <div className="location-dialog-header">
              <h3>Select Pickup Location</h3>
              <button 
                className="close-dialog-btn" 
                onClick={closeLocationDialog}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="location-dialog-content">
              <div className="location-search-bar">
                <input
                  type="text"
                  placeholder="Search for a location..."
                  value={searchLocation}
                  onChange={handleSearchChange}
                />
                <button 
                  className="current-location-btn"
                  onClick={detectCurrentLocation}
                >
                  <FaCrosshairs /> My Location
                </button>
              </div>
              
              {searching && (
                <div className="searching-indicator">
                  Searching locations...
                </div>
              )}
              
              {locationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {locationSuggestions.map((location, index) => (
                    <div 
                      key={index} 
                      className="location-item"
                      onClick={() => selectLocation(location)}
                    >
                      <FaMapMarkerAlt className="location-icon" />
                      <div className="location-details">
                        <span className="location-name">{location.display_name}</span>
                        {location.type && (
                          <span className="location-type">{location.type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="map-container">
                <div className="map-instruction">
                  <FaMapMarkerAlt /> Click or drag the marker on the map to select location
                </div>
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ height: '300px', width: '100%' }}
                  key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} // Force re-render when center changes
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker 
                    position={mapPosition} 
                    setPosition={setMapPosition} 
                    setAddress={setAddressFromMap}
                  />
                </MapContainer>
              </div>
              
              {formData.address && (
                <div className="selected-address">
                  <strong>Selected Address:</strong> {formData.address}
                </div>
              )}
            </div>
            
            <div className="location-dialog-footer">
              <button 
                className="cancel-dialog-btn" 
                onClick={closeLocationDialog}
              >
                Cancel
              </button>
              <button 
                className="confirm-location-btn" 
                onClick={confirmLocation}
                disabled={!formData.address}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateForm;
