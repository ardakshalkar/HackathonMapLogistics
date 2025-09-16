import React, { useEffect, useRef, useState } from 'react';
import './YandexMapPath.css';

const YandexMapPath = ({ 
  startLocation, 
  endLocation, 
  width = '100%', 
  height = '400px',
  zoom = 10,
  onMapReady = () => {},
  onRouteReady = () => {}
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // Callback ref to ensure we know when the element is mounted
  const setMapRef = (element) => {
    console.log('setMapRef called with:', element);
    mapRef.current = element;
    if (element && !initialized) {
      console.log('Map container element set successfully');
      // Trigger initialization when container is ready
      setTimeout(() => {
        if (!initialized) {
          initializeMapWhenReady();
        }
      }, 100);
    }
  };

  const initializeMapWhenReady = () => {
    if (initialized) {
      console.log('Map already initialized, skipping...');
      return;
    }

    try {
      // Find the container element
      let container = mapRef.current;
      if (!container) {
        console.log('Container not found in ref');
        return;
      }

      console.log('Container found:', container);

      // Get container dimensions
      const rect = container.getBoundingClientRect();
      console.log('Container dimensions:', rect.width, 'x', rect.height);
      
      if (rect.width === 0 || rect.height === 0) {
        setError(`Map container has no dimensions: ${rect.width}x${rect.height}. Check CSS styling.`);
        setIsLoading(false);
        return;
      }

      if (!window.ymaps) {
        console.log('Waiting for Yandex Maps API...');
        setTimeout(initializeMapWhenReady, 100);
        return;
      }

      window.ymaps.ready(() => {
        if (!container || map) {
          return; // Prevent double initialization if map already exists
        }

        setInitialized(true); // Mark as initialized

        const center = startLocation ? 
          [startLocation.lat, startLocation.lng] : 
          [55.7558, 37.6176]; // Default to Moscow

        console.log('Creating map with center:', center);

        const newMap = new window.ymaps.Map(container, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        });

        console.log('Map created successfully');
        setMap(newMap);
        setIsLoading(false);
        onMapReady(newMap);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error initializing map: ' + err.message);
      setIsLoading(false);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (map) {
        try {
          map.destroy();
        } catch (err) {
          console.warn('Error destroying map:', err);
        }
      }
    };
  }, [map]);

  // Update route when locations change
  useEffect(() => {
    if (map && startLocation && endLocation) {
      createRoute();
    }
  }, [map, startLocation, endLocation]);


  const createRoute = () => {
    console.log('=== CREATE ROUTE CALLED ===');
    console.log('Map exists:', !!map);
    console.log('Start location:', startLocation);
    console.log('End location:', endLocation);
    console.log('Previous route exists:', !!route);
    
    if (!map || !startLocation || !endLocation) {
      console.log('Route creation skipped - missing requirements');
      return;
    }

    // Clear ALL existing objects from map and reset route state
    console.log('Clearing all map objects...');
    map.geoObjects.removeAll();
    
    if (route) {
      console.log('Destroying previous route...');
      try {
        route.model.destroy();
      } catch (e) {
        console.log('Error destroying route:', e);
      }
      setRoute(null);
    }

    // Clear any Yandex Maps cache if possible
    if (window.ymaps && window.ymaps.ready) {
      console.log('Attempting to clear Yandex Maps cache...');
    }

    // Create multi-route with unique key to ensure fresh route
    const routeKey = `${startLocation.lat}_${startLocation.lng}_${endLocation.lat}_${endLocation.lng}`;
    console.log('Creating new route with key:', routeKey);
    
    const multiRoute = new window.ymaps.multiRouter.MultiRoute({
      referencePoints: [
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ],
      params: {
        routingMode: 'auto', // 'auto', 'walking', 'driving', 'transit'
        routeKey: routeKey, // Add unique identifier
        avoidTolls: false,
        strictBounds: true // Force route within bounds
      }
    }, {
      boundsAutoApply: true,
      routeActiveStrokeWidth: 6,
      routeActiveStrokeColor: '#003dff',
      routeStrokeWidth: 4,
      routeStrokeColor: '#666666',
      wayPointFinishIconImageHref: 'islands#blueStretchyIcon',
      wayPointStartIconImageHref: 'islands#redStretchyIcon'
    });

    // Add route to map
    map.geoObjects.add(multiRoute);
    setRoute(multiRoute);
    
    console.log('MultiRoute object created:', multiRoute);

    // Add markers for start and end points
    const startMarker = new window.ymaps.Placemark(
      [startLocation.lat, startLocation.lng],
      {
        balloonContent: `Start: ${startLocation.name || 'Start Location'}`,
        iconCaption: 'Start'
      },
      {
        preset: 'islands#greenDotIcon',
        iconColor: '#00ff00'
      }
    );

    const endMarker = new window.ymaps.Placemark(
      [endLocation.lat, endLocation.lng],
      {
        balloonContent: `End: ${endLocation.name || 'End Location'}`,
        iconCaption: 'End'
      },
      {
        preset: 'islands#redDotIcon',
        iconColor: '#ff0000'
      }
    );

    map.geoObjects.add(startMarker);
    map.geoObjects.add(endMarker);

    // Fit map to show the entire route and extract waypoints
    multiRoute.model.events.add('requestsuccess', () => {
      console.log('Route request successful!');
      
      // Try different methods to access routes
      const routes = multiRoute.getRoutes();
      const activeRoute = multiRoute.getActiveRoute();
      
      console.log('getRoutes():', routes);
      console.log('getActiveRoute():', activeRoute);
      console.log('Routes length:', routes ? routes.getLength() : 'N/A');
      
      let route = null;
      
      if (activeRoute) {
        route = activeRoute;
        console.log('Using active route');
      } else if (routes && routes.getLength && routes.getLength() > 0) {
        route = routes.get(0);
        console.log('Using first route from collection');
      } else {
        console.log('No routes available');
        return;
      }
      
      if (route) {
        const properties = route.properties.getAll();
        console.log('Route properties:', properties);
        
        // Extract both waypoints and route info, then call onRouteReady once
        console.log('Starting coordinated extraction...');
        
        // First extract waypoints
        const extractedWaypoints = extractWaypointsOnly(multiRoute);
        
        // Then extract route info
        const extractedRouteInfo = extractRouteInfoOnly(multiRoute);
        
        // Now call onRouteReady with both pieces of data
        console.log('=== CALLING onRouteReady WITH COMPLETE DATA ===');
        console.log('Final waypoints:', extractedWaypoints);
        console.log('Final route info:', extractedRouteInfo);
        
        if (onRouteReady && typeof onRouteReady === 'function') {
          onRouteReady(multiRoute, extractedWaypoints, extractedRouteInfo);
        }
        
        if (properties.boundedBy) {
          map.setBounds(properties.boundedBy, {
            checkZoomRange: true,
            zoomMargin: 50
          });
        }
      }
    });

    // Handle route errors
    multiRoute.model.events.add('requesterror', (event) => {
      console.error('Route request failed:', event.get('error'));
      setError('Error creating route: ' + event.get('error').message);
    });

    // Add debug event listeners
    multiRoute.model.events.add('requeststart', () => {
      console.log('Route request started');
    });

    multiRoute.model.events.add('requestsend', () => {
      console.log('Route request sent to Yandex');
    });
  };

  // Extract waypoints using the correct Yandex Maps API (returns data, doesn't call callbacks)
  const extractWaypointsOnly = (multiRouteObj) => {
    try {
      console.log('=== EXTRACTING WAYPOINTS ===');
      console.log('MultiRoute object:', multiRouteObj);
      console.log('Current start location in scope:', startLocation);
      console.log('Current end location in scope:', endLocation);
      
      // Method 1: Get reference points (start and end)
      const wayPoints = multiRouteObj.getWayPoints();
      console.log('WayPoints collection from Yandex:', wayPoints);
      
      const extractedWaypoints = [];
      
      wayPoints.each(function (point, index) {
        const coordinates = point.geometry.getCoordinates();
        const address = point.properties.get('name') || `Point ${index + 1}`;
        
        console.log(`=== PROCESSING WAYPOINT ${index} ===`);
        console.log('Raw coordinates from Yandex:', coordinates);
        console.log('Raw address from Yandex:', address);
        console.log('Available startLocation:', startLocation);
        console.log('Available endLocation:', endLocation);
        
        // Use the original location names instead of Yandex Maps addresses
        let locationName = address;
        if (index === 0 && startLocation && startLocation.name) {
          locationName = startLocation.name;
          console.log('Using original start location name:', locationName);
        } else if (index === 1 && endLocation && endLocation.name) {
          locationName = endLocation.name;
          console.log('Using original end location name:', locationName);
        } else {
          console.log('Using Yandex address:', locationName);
        }
        
        const waypoint = {
          id: index,
          lat: coordinates[0],
          lng: coordinates[1],
          order: index,
          type: index === 0 ? 'start' : 'end',
          name: locationName
        };
        
        extractedWaypoints.push(waypoint);
        
        console.log(`Final waypoint ${index}:`, waypoint);
      });

      // Method 2: TEMPORARILY DISABLED - Route path extraction might be causing issues
      console.log('Skipping intermediate waypoint extraction to debug St. Petersburg issue');
      
      // try {
      //   const routes = multiRouteObj.getRoutes();
      //   if (routes && routes.getLength && routes.getLength() > 0) {
      //     const route = routes.get(0);
      //     console.log('Got route for path extraction:', route);
      //     
      //     // Try different methods to get route path
      //     if (route.geometry && route.geometry.getCoordinates) {
      //       const pathCoords = route.geometry.getCoordinates();
      //       console.log('Route path coordinates:', pathCoords.length);
      //       
      //       // Add intermediate waypoints from route path (sample every Nth point)
      //       const sampleInterval = Math.max(1, Math.floor(pathCoords.length / 20)); // Sample 20 points max
      //       console.log(`Sampling ${pathCoords.length} path coordinates with interval ${sampleInterval}`);
      //       
      //       pathCoords.forEach((coord, index) => {
      //         if (index > 0 && index < pathCoords.length - 1 && index % sampleInterval === 0) {
      //           console.log(`Adding intermediate waypoint ${index}: [${coord[0]}, ${coord[1]}]`);
      //           extractedWaypoints.push({
      //             id: extractedWaypoints.length,
      //             lat: coord[0],
      //             lng: coord[1],
      //             order: extractedWaypoints.length,
      //             type: 'waypoint',
      //             name: `Route point ${Math.floor(index / sampleInterval)}`
      //           });
      //         }
      //       });
      //     }
      //   }
      // } catch (pathError) {
      //   console.log('Could not extract route path, using reference points only:', pathError);
      // }

      console.log(`Extracted ${extractedWaypoints.length} total waypoints`);
      console.log('Extracted waypoints details:', extractedWaypoints);
      setWaypoints(extractedWaypoints);
      
      // Return waypoints instead of calling callback
      return extractedWaypoints;

    } catch (error) {
      console.error('Error extracting waypoints:', error);
      return [];
    }
  };

  // Extract route information using the correct Yandex Maps API (returns data, doesn't call callbacks)
  const extractRouteInfoOnly = (multiRouteObj) => {
    try {
      console.log('Extracting route info from multiRoute:', multiRouteObj);
      
      // Try to get route properties from the multiRoute model
      let totalDistance = 0;
      let totalDuration = 0;
      let segmentCount = 0;
      
      try {
        const routes = multiRouteObj.getRoutes();
        if (routes && routes.getLength && routes.getLength() > 0) {
          const route = routes.get(0);
          const properties = route.properties.getAll();
          
          console.log('Route properties:', properties);
          
          // Extract distance and duration from properties
          if (properties.distance) {
            totalDistance = properties.distance.value || 0;
          }
          if (properties.duration) {
            totalDuration = properties.duration.value || 0;
          }
          
          console.log('Distance from route:', totalDistance, 'Duration:', totalDuration);
        }
      } catch (routeError) {
        console.log('Could not extract from route, trying model:', routeError);
        
        // Fallback: try to get from model
        try {
          const model = multiRouteObj.model;
          if (model && model.getActiveRoute) {
            const activeRoute = model.getActiveRoute();
            if (activeRoute) {
              const props = activeRoute.properties.getAll();
              console.log('Active route properties:', props);
              
              if (props.distance) totalDistance = props.distance.value || 0;
              if (props.duration) totalDuration = props.duration.value || 0;
            }
          }
        } catch (modelError) {
          console.log('Could not extract from model:', modelError);
        }
      }
      
      // If we still don't have data, create estimated values
      if (totalDistance === 0) {
        // Estimate distance between start and end points
        const wayPoints = multiRouteObj.getWayPoints();
        if (wayPoints.getLength && wayPoints.getLength() >= 2) {
          const start = wayPoints.get(0).geometry.getCoordinates();
          const end = wayPoints.get(wayPoints.getLength() - 1).geometry.getCoordinates();
          
          // Simple distance calculation (not accurate but better than 0)
          const R = 6371000; // Earth's radius in meters
          const dLat = (end[0] - start[0]) * Math.PI / 180;
          const dLng = (end[1] - start[1]) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          totalDistance = R * c;
          
          // Estimate duration (60 km/h average)
          totalDuration = (totalDistance / 1000) * 60; // seconds
          
          console.log('Estimated distance:', totalDistance, 'Estimated duration:', totalDuration);
        }
      }

      const routeInfo = {
        totalDistance: totalDistance,
        totalDuration: totalDuration,
        totalDistanceText: `${(totalDistance / 1000).toFixed(1)} km`,
        totalDurationText: `${Math.round(totalDuration / 60)} min`,
        segmentCount: segmentCount || 1,
        segments: [],
        waypointCount: waypoints.length
      };

      console.log('Final route info:', routeInfo);
      setRouteInfo(routeInfo);
      
      // Return route info instead of calling callback
      return routeInfo;

    } catch (error) {
      console.error('Error extracting route info:', error);
      return null;
    }
  };

  return (
    <div className="yandex-map-container">
      <div 
        ref={setMapRef} 
        id={`yandex-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
        className="yandex-map" 
        style={{ width, height }}
      >
        {isLoading && (
          <div className="map-loading-overlay">
            <div className="loading-spinner">
              Loading map...
              <br />
              <small>Yandex Maps API: {window.ymaps ? 'Loaded' : 'Loading...'}</small>
              <br />
              <small>Container: {mapRef.current ? 'Ready' : 'Waiting...'}</small>
            </div>
          </div>
        )}
        
        {error && (
          <div className="map-error-overlay">
            <div className="error-message">
              <h3>Map Error</h3>
              <p>{error}</p>
              {error.includes('API key') && (
                <div className="api-key-help">
                  <p><strong>To fix this:</strong></p>
                  <ol>
                    <li>Get a valid API key from <a href="https://developer.tech.yandex.ru/" target="_blank" rel="noopener noreferrer">Yandex Developer Console</a></li>
                    <li>Replace <code>YOUR_API_KEY</code> in <code>public/index.html</code></li>
                    <li>Restart the application</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YandexMapPath;
