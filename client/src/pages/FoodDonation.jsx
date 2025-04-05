import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./FoodDonation.css";

// Fix leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map marker component with click events
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  });

  return position ? <Marker position={position} /> : null;
}

function FoodDonation() {
  const [foodName, setFoodName] = useState("");
  const [foodTag, setFoodTag] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [address, setAddress] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, detecting, success, error
  const [locationError, setLocationError] = useState("");

  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Function to detect user's location
  const detectUserLocation = useCallback(() => {
    setLocationStatus("detecting");
    setLocationError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          setUserLocation({
            lat: latitude,
            lng: longitude,
            coordinates: [longitude, latitude] // [longitude, latitude] format for MongoDB
          });
          
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
          
          // Reverse geocode to get address from coordinates
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (response.data && response.data.display_name) {
              setAddress(response.data.display_name);
              setLocationStatus("success");
            }
          } catch (error) {
            console.error("Error getting address from coordinates:", error);
            setLocationStatus("success"); // Still mark as success since we got coordinates
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMsg = "Unable to detect your location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Location permission denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMsg = "Location request timed out. Please try again.";
              break;
          }
          
          setLocationError(errorMsg);
          setLocationStatus("error");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationStatus("error");
    }
  }, []);

  // Try to get user location on component mount
  useEffect(() => {
    if (token) {
      detectUserLocation();
    }
  }, [token, detectUserLocation]);

  // Update form data when marker position changes
  const handleMarkerPosition = useCallback((position) => {
    if (position) {
      setUserLocation({
        lat: position[0],
        lng: position[1],
        coordinates: [position[1], position[0]] // [lng, lat] for MongoDB
      });
      
      // Reverse geocode to get address
      (async () => {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
          );
          
          if (response.data && response.data.display_name) {
            setAddress(response.data.display_name);
          }
        } catch (error) {
          console.error("Error getting address:", error);
        }
      })();
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Reset messages
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);
    
    // Form validation
    if (!foodName || !foodTag || !quantity || !expiryDate || !address) {
      setErrorMessage("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    // Check if we have location coordinates
    if (!userLocation) {
      setErrorMessage("Please set your location on the map or use the detect location button");
      setIsSubmitting(false);
      return;
    }

    const formData = {
      foodName,
      foodTag,
      quantity: Number(quantity),
      expiryDate,
      address,
      email,
      location: {
        type: "Point",
        coordinates: userLocation.coordinates
      }
    };

    try {
      const response = await axios.post("http://localhost:3000/fooddonation", {
        formData,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Donation response:", response.data);

      // Show success message
      setSuccessMessage(`Thanks for donating ${foodName}! Your donation has been registered successfully.`);

      // Clear form fields after successful submission
      setFoodName("");
      setFoodTag("");
      setQuantity("");
      setExpiryDate("");
      setAddress("");
      setUserLocation(null);

      // Redirect to the food listings page after a delay
      setTimeout(() => {
        navigate("/dashboard/food");
      }, 3000);
    } catch (error) {
      console.error("Donation error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="foodDonation_container">
      <div className="foodDonation_heading">
        <h1 className="heading-foodd">FOOD DONATION FORM</h1>
      </div>

      {/* Show success message if available */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Show error message if available */}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="foodDonation_wrapper">
        <form className="food-donation_form" onSubmit={handleSubmit}>
          <div className="form_element">
            <label htmlFor="foodName">Food Name</label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              placeholder="Enter food name"
              required
            />
          </div>

          <div className="form_element">
            <label htmlFor="quantity">Quantity (servings)</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Number of servings"
              min="1"
              required 
            />
          </div>

          <div className="form_element">
            <label htmlFor="foodTag">Food Type</label>
            <select
              id="foodTag"
              name="foodTag"
              value={foodTag}
              onChange={(event) => setFoodTag(event.target.value)}
              required
            >
              <option value="" disabled>
                Choose type
              </option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="form_element">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={expiryDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) => setExpiryDate(event.target.value)}
              required
            />
          </div>

          <div className="form_element location-field">
            <label htmlFor="address">Pickup Address</label>
            <div className="address-input-container">
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter pickup address"
                required
              />
              <button 
                type="button" 
                className={`detect-location-btn ${locationStatus}`}
                onClick={detectUserLocation}
                disabled={locationStatus === "detecting"}
              >
                <FaMapMarkerAlt />
                {locationStatus === "detecting" ? "Detecting..." : "Detect Location"}
              </button>
            </div>
            
            {locationStatus === "success" && (
              <div className="location-success">
                <FaMapMarkerAlt /> Location detected successfully!
              </div>
            )}
            
            {locationStatus === "error" && (
              <div className="location-error">
                <FaExclamationTriangle /> {locationError}
              </div>
            )}
          </div>

          <div className="form_element map-container">
            <label>Select Location on Map (Click to set pickup point)</label>
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '300px', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker 
                position={userLocation ? [userLocation.lat, userLocation.lng] : null} 
                setPosition={handleMarkerPosition}
              />
            </MapContainer>
            <div className="map-instructions">
              <FaMapMarkerAlt /> Click on the map to set the exact pickup location
            </div>
          </div>

          <button 
            id="foodDonation_submit-btn" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Donate Food"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FoodDonation;
