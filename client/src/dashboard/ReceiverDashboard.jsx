import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaUtensils, FaExclamationTriangle, FaRedoAlt, FaMapMarked, FaList } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Component to update map view when center changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && 
        !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

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
  const [highlightedCardId, setHighlightedCardId] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Used to force map re-render
  const mapRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Initialize component
  useEffect(() => {
    isComponentMounted.current = true;
    requestLocationPermission();
    
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  const requestLocationPermission = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setLocationPermissionStatus("requesting");
    setError("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isComponentMounted.current) return;
          
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermissionStatus("granted");
          setMapCenter([latitude, longitude]);
          setMapZoom(11);
          fetchNearbyFood(latitude, longitude, range);
        },
        (error) => {
          if (!isComponentMounted.current) return;
          
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
            default:
              errorMsg = "An unknown error occurred while getting your location.";
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
      if (!isComponentMounted.current) return;
      
      setError("Geolocation is not supported by this browser.");
      setLocationPermissionStatus("denied");
      setLoading(false);
      fetchNearbyFood(null, null, range);
    }
  }, [range]);

  // Fetch nearby food when range changes
  useEffect(() => {
    if (userLocation && isComponentMounted.current) {
      fetchNearbyFood(userLocation.lat, userLocation.lng, range);
    }
  }, [range, userLocation]);

  const fetchNearbyFood = async (lat, lng, distance) => {
    if (!isComponentMounted.current) return;
    
    try {
      setLoading(true);
      
      let url = "http://localhost:3000/availabledonations";
      if (lat && lng) {
        url = `http://localhost:3000/nearbyfoods?lat=${lat}&lng=${lng}&distance=${distance}`;
      }
      
      const response = await axios.get(url);
      
      if (!isComponentMounted.current) return;
      
      if (response.data.success) {
        setNearbyFood(response.data.donations || []);
      } else {
        setError("Failed to fetch food items");
      }
    } catch (err) {
      if (!isComponentMounted.current) return;
      
      console.error("Error fetching nearby food:", err);
      setError("Failed to fetch nearby food. Please try again later.");
    } finally {
      if (isComponentMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleRangeChange = (e) => {
    setRange(Number(e.target.value));
  };

  const toggleViewMode = () => {
    if (viewMode === "list") {
      // Switching to map view, generate a new key to force re-render
      setMapKey(Date.now());
      setViewMode("map");
    } else {
      setViewMode("list");
    }
  };

  const scrollToCard = (id) => {
    setViewMode("list");
    setHighlightedCardId(id);
    
    // Use a timeout to ensure the view has changed
    setTimeout(() => {
      const cardElement = document.getElementById(`food-card-${id}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardElement.classList.add('highlight-card');
        setTimeout(() => {
          if (isComponentMounted.current && cardElement) {
            cardElement.classList.remove('highlight-card');
          }
        }, 2000);
      }
    }, 300);
  };

  // Render map only when in map view to save resources
  const renderMap = () => {
    if (viewMode !== "map") return null;
    
    return (
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '600px', width: '100%' }}
          key={mapKey} // Force re-render with new key
          whenCreated={(map) => { mapRef.current = map; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />
          
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
            // Skip items without valid location data
            if (!item.location || !item.location.coordinates || 
                item.location.coordinates.length !== 2) {
              return null;
            }
            
            const [lng, lat] = item.location.coordinates;
            
            // Additional validation to prevent map errors
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
              return null;
            }
            
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
                      onClick={() => scrollToCard(item._id)}
                    >
                      View Details & Request
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
    );
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
          <p>Finding food listings near you...</p>
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
        <div className="food-content">
          {viewMode === "list" && (
            <div className="nearby-food-grid">
              {nearbyFood.map((item) => (
                <div 
                  key={item._id} 
                  id={`food-card-${item._id}`}
                  className={`food-card-container ${highlightedCardId === item._id ? 'highlight-card' : ''}`}
                >
                  <FoodCard
                    id={item._id}
                    name={item.foodName}
                    quantity={item.quantity}
                    date={item.expiryDate}
                    address={item.address}
                    tag={item.foodTag}
                    donorName={item.user?.name || "Anonymous"}
                    userRole="needy"
                    distance={item.distance?.toFixed(1) || null}
                    onRequestSuccess={() => fetchNearbyFood(
                      userLocation?.lat, 
                      userLocation?.lng, 
                      range
                    )}
                  />
                </div>
              ))}
            </div>
          )}
          
          {viewMode === "map" && renderMap()}
        </div>
      )}
    </div>
  );
};

export default ReceiverDashboard;
