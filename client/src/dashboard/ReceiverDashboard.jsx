import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaUtensils, FaExclamationTriangle, FaRedoAlt, FaMapMarked, FaList } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./ReceiverDashboard.css";
import FoodCard from "./FoodCard";

// Fix leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const vegIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nonVegIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ReceiverDashboard = () => {
  const [nearbyFood, setNearbyFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [range, setRange] = useState(5); // Default 5km range
  const [viewMode, setViewMode] = useState("list"); // list or map
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState("idle");

  // Get user's location on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = useCallback(() => {
    setLocationPermissionStatus("requesting");
    setError("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermissionStatus("granted");
          setMapCenter([latitude, longitude]);
          setMapZoom(11);
          fetchNearbyFood(latitude, longitude, range);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMsg = "Unable to get your location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Location access denied. Please enable location services for the best experience.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMsg = "Location request timed out. Please try again.";
              break;
          }
          
          setError(errorMsg);
          setLocationPermissionStatus("denied");
          setLoading(false);
          
          // Try to fetch food without location, but warn the user
          fetchNearbyFood(null, null, range);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocationPermissionStatus("denied");
      setLoading(false);
      fetchNearbyFood(null, null, range);
    }
  }, [range]);

  // Fetch nearby food when range changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyFood(userLocation.lat, userLocation.lng, range);
    }
  }, [range, userLocation]);

  const fetchNearbyFood = async (lat, lng, distance) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/nearbyfoods?lat=${lat}&lng=${lng}&distance=${distance}`);
      
      setNearbyFood(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching nearby food:", err);
      setError("Failed to fetch nearby food. Please try again later.");
      setLoading(false);
    }
  };

  const handleRangeChange = (e) => {
    setRange(Number(e.target.value));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "map" : "list");
  };

  return (
    <div className="receiver-dashboard">
      <div className="receiver-header">
        <h1><FaUtensils /> Food Available Near You</h1>
        <div className="header-controls">
          <div className={`location-status ${locationPermissionStatus}`}>
            <FaMapMarkerAlt />
            {locationPermissionStatus === "requesting" && <span>Requesting location access...</span>}
            {locationPermissionStatus === "granted" && <span>Using your current location</span>}
            {locationPermissionStatus === "denied" && (
              <div className="location-retry">
                <span>Location unavailable</span>
                <button onClick={requestLocationPermission} className="retry-btn">
                  <FaRedoAlt /> Retry
                </button>
              </div>
            )}
            {locationPermissionStatus === "idle" && <span>Preparing to locate you...</span>}
          </div>
          
          <button 
            className={`view-toggle-btn ${viewMode}`} 
            onClick={toggleViewMode}
            title={viewMode === "list" ? "Switch to Map View" : "Switch to List View"}
          >
            {viewMode === "list" ? <FaMapMarked /> : <FaList />}
            {viewMode === "list" ? "Map View" : "List View"}
          </button>
        </div>
      </div>

      {locationPermissionStatus === "granted" && (
        <div className="filter-bar">
          <div className="range-slider">
            <label htmlFor="range">Search Distance: {range} km</label>
            <input
              type="range"
              id="range"
              min="1"
              max="25"
              value={range}
              onChange={handleRangeChange}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding food listings...</p>
        </div>
      ) : nearbyFood.length === 0 ? (
        <div className="no-food-container">
          <h2>No Food Available{locationPermissionStatus === "granted" ? " Nearby" : ""}</h2>
          <p>
            {locationPermissionStatus === "granted" 
              ? "Try increasing your search distance or check back later."
              : "There are no food donations available at the moment. Please check back later."}
          </p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="nearby-food-grid">
              {nearbyFood.map((item) => (
                <FoodCard
                  key={item._id}
                  id={item._id}
                  name={item.foodName}
                  quantity={item.quantity}
                  date={item.expiryDate}
                  address={item.address}
                  tag={item.foodTag}
                  donorName={item.user?.name || "Anonymous"}
                  userRole="needy"
                  distance={item.distance?.toFixed(1) || null}
                />
              ))}
            </div>
          ) : (
            <div className="map-view-container">
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '600px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={new L.Icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    })}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>Your Location</strong>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {nearbyFood.map((item) => {
                  // Skip items without location data
                  if (!item.location || !item.location.coordinates || item.location.coordinates.length !== 2) {
                    return null;
                  }
                  
                  const [lng, lat] = item.location.coordinates;
                  
                  return (
                    <Marker 
                      key={item._id}
                      position={[lat, lng]}
                      icon={item.foodTag === 'veg' ? vegIcon : nonVegIcon}
                    >
                      <Popup>
                        <div className="map-popup">
                          <h3>{item.foodName}</h3>
                          <p><strong>Type:</strong> {item.foodTag === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                          <p><strong>Quantity:</strong> {item.quantity} servings</p>
                          <p><strong>Expires:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                          <p><strong>Donor:</strong> {item.user?.name || 'Anonymous'}</p>
                          {item.distance && <p><strong>Distance:</strong> {item.distance.toFixed(1)} km</p>}
                          <button 
                            className="popup-request-btn"
                            onClick={() => window.alert(`Request for ${item.foodName} sent!`)}
                          >
                            Request Food
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-icon veg"></div>
                  <span>Vegetarian Food</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon non-veg"></div>
                  <span>Non-Vegetarian Food</span>
                </div>
                <div className="legend-item">
                  <div className="legend-icon you"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReceiverDashboard;
