import React, { useState } from 'react';
import DelayPredictionModal from './DelayPredictionModal';
import './RouteInfo.css';

const RouteInfo = ({ waypoints = [], routeInfo = null }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showDelayModal, setShowDelayModal] = useState(false);

  if (!routeInfo && waypoints.length === 0) {
    return null;
  }

  const formatCoordinate = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Coordinates copied to clipboard!');
    });
  };

  const exportWaypoints = () => {
    const csvContent = [
      'Order,Type,Latitude,Longitude',
      ...waypoints.map(wp => `${wp.order},${wp.type},${wp.lat},${wp.lng}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route_waypoints.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="route-info">
      <div className="route-info-header">
        <h3>Route Information</h3>
        <div className="route-stats">
          {routeInfo && (
            <>
              <div className="stat-item">
                <span className="stat-label">Distance:</span>
                <span className="stat-value">{routeInfo.totalDistanceText}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{routeInfo.totalDurationText}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Waypoints:</span>
                <span className="stat-value">{waypoints.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Segments:</span>
                <span className="stat-value">{routeInfo.segmentCount}</span>
              </div>
            </>
          )}
        </div>
        
        {routeInfo && (
          <div className="route-actions">
            <button 
              className="predict-delay-button"
              onClick={() => setShowDelayModal(true)}
            >
              🔮 Predict Delay
            </button>
          </div>
        )}
      </div>

      <div className="waypoints-section">
        <div className="waypoints-header">
          <h4>Route Waypoints ({waypoints.length})</h4>
          <div className="waypoints-actions">
            <button 
              className="action-button"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button 
              className="action-button export-button"
              onClick={exportWaypoints}
            >
              Export CSV
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="waypoints-list">
            <div className="waypoints-summary">
              <p>
                <strong>Yandex Maps provides:</strong> {waypoints.length} detailed waypoints along the route.
                These points represent the exact path the vehicle will follow, including all turns and road changes.
              </p>
              <p>
                <strong>Waypoint density:</strong> Approximately {Math.round(waypoints.length / (routeInfo?.totalDistance / 1000 || 1))} points per kilometer.
              </p>
            </div>

            <div className="waypoints-table-container">
              <table className="waypoints-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Type</th>
                    <th>Coordinates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waypoints.slice(0, 50).map((waypoint) => (
                    <tr 
                      key={waypoint.id}
                      className={`waypoint-row ${waypoint.type}`}
                      onClick={() => setSelectedWaypoint(waypoint)}
                    >
                      <td>{waypoint.order + 1}</td>
                      <td>
                        <span className={`waypoint-type ${waypoint.type}`}>
                          {waypoint.type === 'start' ? '🚀 Start' :
                           waypoint.type === 'end' ? '🏁 End' : '📍 Waypoint'}
                        </span>
                      </td>
                      <td className="coordinates">
                        {formatCoordinate(waypoint.lat, waypoint.lng)}
                      </td>
                      <td>
                        <button 
                          className="copy-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(formatCoordinate(waypoint.lat, waypoint.lng));
                          }}
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {waypoints.length > 50 && (
                <div className="waypoints-note">
                  Showing first 50 waypoints. Total: {waypoints.length}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedWaypoint && (
          <div className="waypoint-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Waypoint Details</h4>
                <button 
                  className="close-button"
                  onClick={() => setSelectedWaypoint(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="waypoint-detail">
                  <p><strong>Order:</strong> {selectedWaypoint.order + 1}</p>
                  <p><strong>Type:</strong> {selectedWaypoint.type}</p>
                  <p><strong>Latitude:</strong> {selectedWaypoint.lat}</p>
                  <p><strong>Longitude:</strong> {selectedWaypoint.lng}</p>
                  <p><strong>Coordinates:</strong> {formatCoordinate(selectedWaypoint.lat, selectedWaypoint.lng)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {routeInfo && routeInfo.segments && showDetails && (
        <div className="segments-section">
          <h4>Route Segments ({routeInfo.segmentCount})</h4>
          <div className="segments-list">
            {routeInfo.segments.map((segment, index) => (
              <div key={index} className="segment-item">
                <div className="segment-number">Segment {segment.index}</div>
                <div className="segment-details">
                  <span>Distance: {segment.distanceText}</span>
                  <span>Duration: {segment.durationText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DelayPredictionModal 
        isOpen={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        waypoints={waypoints}
        routeInfo={routeInfo}
      />
    </div>
  );
};

export default RouteInfo;
