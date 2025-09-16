import React, { useState } from 'react';
import YandexMapPath from './YandexMapPath';
import SearchableLocationInput from './SearchableLocationInput';
import RouteInfo from './RouteInfo';
import RoutePrediction from './RoutePrediction';
import './MapExample.css';

const MapExample = () => {
  const [startLocation, setStartLocation] = useState({
    lat: 55.7558,
    lng: 37.6176,
    name: 'Moscow, Russia'
  });

  const [endLocation, setEndLocation] = useState({
    lat: 59.9311,
    lng: 30.3609,
    name: 'St. Petersburg, Russia'
  });

  const [waypoints, setWaypoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const predefinedLocations = [
    { lat: 55.7558, lng: 37.6176, name: 'Moscow, Russia' },
    { lat: 59.9311, lng: 30.3609, name: 'St. Petersburg, Russia' },
    { lat: 43.2380, lng: 76.9452, name: 'Almaty, Kazakhstan' },
    { lat: 51.1694, lng: 71.4491, name: 'Nur-Sultan, Kazakhstan' },
    { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }
  ];

  const handleMapReady = (map) => {
    console.log('Map is ready:', map);
  };

  const handleRouteReady = (route, waypoints, routeInfo) => {
    console.log('Route is ready:', route);
    console.log('Waypoints received:', waypoints?.length || 0);
    console.log('Route info received:', !!routeInfo);
    console.log('Current start location:', startLocation?.name);
    console.log('Current end location:', endLocation?.name);
    
    // Update waypoints with current location names
    const updatedWaypoints = waypoints?.map((waypoint, index) => {
      if (waypoint.type === 'start') {
        return { ...waypoint, name: startLocation?.name || waypoint.name };
      } else if (waypoint.type === 'end') {
        return { ...waypoint, name: endLocation?.name || waypoint.name };
      }
      return waypoint;
    }) || [];
    
    setWaypoints(updatedWaypoints);
    setRouteInfo(routeInfo || null);
  };

  const handleRefreshRoute = () => {
    console.log('Manual route refresh triggered');
    setWaypoints([]);
    setRouteInfo(null);
    // Force route recalculation by slightly modifying the start location
    const newStart = { ...startLocation };
    setStartLocation({ ...newStart });
  };

  return (
    <div className="map-example">
      <div className="map-example-header">
        <h1>Yandex Maps Path Component</h1>
        <p>Select two locations to see the path between them and 8-hour predictions</p>
        <button 
          onClick={handleRefreshRoute}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🔄 Refresh Route & Predictions
        </button>
      </div>

      <div className="map-example-controls">
        <div className="location-controls">
          <div className="location-group">
            <SearchableLocationInput
              label="Start Location"
              value={startLocation}
              onChange={(location) => setStartLocation(location)}
              placeholder="Search for start city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(0, 4).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => setStartLocation(location)}
                  >
                    {location.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="location-group">
            <SearchableLocationInput
              label="End Location"
              value={endLocation}
              onChange={(location) => setEndLocation(location)}
              placeholder="Search for destination city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(4, 8).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => setEndLocation(location)}
                  >
                    {location.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-container">
        <YandexMapPath
          startLocation={startLocation}
          endLocation={endLocation}
          width="100%"
          height="500px"
          zoom={6}
          onMapReady={handleMapReady}
          onRouteReady={handleRouteReady}
        />
      </div>

      <RouteInfo waypoints={waypoints} routeInfo={routeInfo} />
      
      <RoutePrediction waypoints={waypoints} routeInfo={routeInfo} />
    </div>
  );
};

export default MapExample;
