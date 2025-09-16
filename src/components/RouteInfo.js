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
      alert('Координаты скопированы в буфер обмена!');
    });
  };

  const exportWaypoints = () => {
    const csvContent = [
      'Порядок,Тип,Широта,Долгота',
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
        <h3>Информация о маршруте</h3>
        <div className="route-stats">
          {routeInfo && (
            <>
              <div className="stat-item">
                <span className="stat-label">Расстояние:</span>
                <span className="stat-value">{routeInfo.totalDistanceText}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Продолжительность:</span>
                <span className="stat-value">{routeInfo.totalDurationText}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Путевые точки:</span>
                <span className="stat-value">{waypoints.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Сегменты:</span>
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
              🔮 Прогноз задержки
            </button>
          </div>
        )}
      </div>

      <div className="waypoints-section">
        <div className="waypoints-header">
          <h4>Путевые точки маршрута ({waypoints.length})</h4>
          <div className="waypoints-actions">
            <button 
              className="action-button"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Скрыть детали' : 'Показать детали'}
            </button>
            <button 
              className="action-button export-button"
              onClick={exportWaypoints}
            >
              Экспорт CSV
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="waypoints-list">
            <div className="waypoints-summary">
              <p>
                <strong>Яндекс Карты предоставляют:</strong> {waypoints.length} детальных путевых точек по маршруту.
                Эти точки представляют точный путь, которым будет следовать транспортное средство, включая все повороты и смены дорог.
              </p>
              <p>
                <strong>Плотность путевых точек:</strong> Примерно {Math.round(waypoints.length / (routeInfo?.totalDistance / 1000 || 1))} точек на километр.
              </p>
            </div>

            <div className="waypoints-table-container">
              <table className="waypoints-table">
                <thead>
                  <tr>
                    <th>Порядок</th>
                    <th>Тип</th>
                    <th>Координаты</th>
                    <th>Действия</th>
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
                          {waypoint.type === 'start' ? '🚀 Начало' :
                           waypoint.type === 'end' ? '🏁 Конец' : '📍 Путевая точка'}
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
                          Копировать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {waypoints.length > 50 && (
                <div className="waypoints-note">
                  Показаны первые 50 путевых точек. Всего: {waypoints.length}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedWaypoint && (
          <div className="waypoint-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Детали путевой точки</h4>
                <button 
                  className="close-button"
                  onClick={() => setSelectedWaypoint(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="waypoint-detail">
                  <p><strong>Порядок:</strong> {selectedWaypoint.order + 1}</p>
                  <p><strong>Тип:</strong> {selectedWaypoint.type}</p>
                  <p><strong>Широта:</strong> {selectedWaypoint.lat}</p>
                  <p><strong>Долгота:</strong> {selectedWaypoint.lng}</p>
                  <p><strong>Координаты:</strong> {formatCoordinate(selectedWaypoint.lat, selectedWaypoint.lng)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {routeInfo && routeInfo.segments && showDetails && (
        <div className="segments-section">
          <h4>Сегменты маршрута ({routeInfo.segmentCount})</h4>
          <div className="segments-list">
            {routeInfo.segments.map((segment, index) => (
              <div key={index} className="segment-item">
                <div className="segment-number">Сегмент {segment.index}</div>
                <div className="segment-details">
                  <span>Расстояние: {segment.distanceText}</span>
                  <span>Продолжительность: {segment.durationText}</span>
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
