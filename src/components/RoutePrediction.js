import React, { useState, useEffect } from 'react';
import RoutePredictionService from '../services/routePrediction';
import './RoutePrediction.css';

const RoutePrediction = ({ waypoints = [], routeInfo = null }) => {
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [truckType, setTruckType] = useState('standard');
  const [routeConditions, setRouteConditions] = useState('default');

  const predictionService = new RoutePredictionService();

  // Calculate predictions when waypoints or route info changes
  useEffect(() => {
    if (waypoints.length > 0 && routeInfo) {
      calculatePredictions();
    }
  }, [waypoints, routeInfo, startTime, truckType, routeConditions]);

  const calculatePredictions = async () => {
    console.log('Calculating predictions with:', { 
      waypointsCount: waypoints.length, 
      routeInfo: routeInfo 
    });
    
    setIsLoading(true);
    
    try {
      // Calculate time-based positions with city detection
      const timePredictions = predictionService.calculateTimeBasedPositions(
        waypoints, 
        routeInfo, 
        startTime,
        truckType,
        routeConditions
      );
      
      console.log('Generated predictions:', timePredictions.length);
      setPredictions(timePredictions);
    } catch (error) {
      console.error('Error calculating predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(new Date(e.target.value));
  };

  const handleTruckTypeChange = (e) => {
    setTruckType(e.target.value);
  };

  const handleRouteConditionsChange = (e) => {
    setRouteConditions(e.target.value);
  };

  const exportPredictions = () => {
    const csvContent = [
      'Время,Широта,Долгота,Расстояние (км),Тип,Часы вождения,Время перерыва,Ориентировочное прибытие,Ближайший город,Расстояние до города (км),Интервал часов',
      ...predictions.map(pred => {
        return [
          pred.time.toISOString(),
          pred.lat.toFixed(6),
          pred.lng.toFixed(6),
          (pred.distance / 1000).toFixed(2),
          pred.type,
          pred.drivingHours?.toFixed(1) || '0',
          pred.breakTime?.toFixed(1) || '0',
          pred.estimatedArrival?.toISOString() || '',
          pred.nearbyCity?.name || 'Нет ближайших городов',
          pred.nearbyCity?.distance || '',
          pred.intervalHours || '0'
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  console.log('RoutePrediction render:', { waypoints: waypoints.length, routeInfo: !!routeInfo });

  if (!routeInfo || waypoints.length === 0) {
    return (
      <div className="route-prediction">
        <div className="no-data">
          <h3>Прогноз маршрута и 8-часовые интервалы</h3>
          <p>Пожалуйста, выберите начальное и конечное местоположение для просмотра прогнозов на 8-часовые интервалы</p>
          <p><small>Debug: Waypoints: {waypoints.length}, RouteInfo: {routeInfo ? 'Available' : 'Missing'}</small></p>
        </div>
      </div>
    );
  }

  const fuelConsumption = predictionService.calculateFuelConsumption(routeInfo.totalDistance, truckType);

  return (
    <div className="route-prediction">
        <div className="prediction-header">
        <h3>Прогноз маршрута и определение городов</h3>
        
        <div className="prediction-controls">
          <div className="control-group">
            <label>Время начала:</label>
            <input
              type="datetime-local"
              value={startTime.toISOString().slice(0, 16)}
              onChange={handleStartTimeChange}
              className="time-input"
            />
          </div>
          
          <div className="control-group">
            <label>Тип грузовика:</label>
            <select value={truckType} onChange={handleTruckTypeChange} className="truck-select">
              <option value="light">Легкий грузовик (70 км/ч, 0.25 л/км)</option>
              <option value="standard">Стандартный грузовик (60 км/ч, 0.35 л/км)</option>
              <option value="heavy">Тяжелый грузовик (50 км/ч, 0.45 л/км)</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Условия маршрута:</label>
            <select value={routeConditions} onChange={handleRouteConditionsChange} className="truck-select">
              <option value="default">Смешанные маршруты (обычная скорость)</option>
              <option value="highway">Автомагистрали (+20% скорости)</option>
              <option value="city">Городские маршруты (-30% скорости)</option>
              <option value="mountain">Горные маршруты (-20% скорости)</option>
            </select>
          </div>
          
          
          <button onClick={exportPredictions} className="export-button">
            Экспорт прогнозов
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p><strong>Расчет прогнозов на 8-часовые интервалы...</strong></p>
          <p>Это покажет вам, где будет находиться грузовик каждые 8 часов по маршруту</p>
        </div>
      )}

      {!isLoading && predictions.length > 0 && (
        <>
          <div className="prediction-summary">
            <div className="summary-item">
              <span className="label">Общая продолжительность:</span>
              <span className="value">{predictionService.formatDuration(routeInfo.totalDuration / 3600)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Точки прогноза:</span>
              <span className="value">{predictions.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Расход топлива:</span>
              <span className="value">{fuelConsumption.totalFuel}L ({fuelConsumption.truckType})</span>
            </div>
            <div className="summary-item">
              <span className="label">Ориентировочное время прибытия:</span>
              <span className="value">
                {predictions[predictions.length - 1]?.estimatedArrival?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="predictions-timeline">
            <h4>Прогнозы на 8-часовые интервалы</h4>
            <div className="timeline-container">
              {predictions.map((prediction, index) => (
                <div key={index} className={`timeline-item ${prediction.type}`}>
                  <div className="timeline-marker">
                    <div className="marker-icon">
                      {prediction.type === 'start' ? '🚀' :
                       prediction.type === 'destination' ? '🏁' : '📍'}
                    </div>
                    <div className="marker-time">
                      {predictionService.formatTime(prediction.time)}
                    </div>
                  </div>
                  
                  <div className="timeline-content">
                    <div className="prediction-details">
                      <div className="location-info">
                        <h5>
                          {prediction.type === 'start' ? `Начало: ${prediction.name || 'Неизвестно'}` :
                           prediction.type === 'destination' ? `Назначение: ${prediction.name || 'Неизвестно'}` : 
                           `Позиция ${index}`}
                        </h5>
                        <p className="coordinates">
                          {prediction.lat.toFixed(6)}, {prediction.lng.toFixed(6)}
                        </p>
                        <p className="distance">
                          {prediction.distance ? `${(prediction.distance / 1000).toFixed(1)} km` : '0 km'} 
                          {prediction.progress && ` (${prediction.progress.toFixed(1)}%)`}
                        </p>
                      </div>
                      
                      <div className="logistics-info">
                        {prediction.drivingHours && (
                          <div className="info-item">
                            <span className="info-label">Вождение:</span>
                            <span className="info-value">{prediction.drivingHours.toFixed(1)}h</span>
                          </div>
                        )}
                        {prediction.breakTime && prediction.breakTime > 0 && (
                          <div className="info-item">
                            <span className="info-label">Перерыв:</span>
                            <span className="info-value">{prediction.breakTime.toFixed(1)}h</span>
                          </div>
                        )}
                        {prediction.remainingDistance && (
                          <div className="info-item">
                            <span className="info-label">Осталось:</span>
                            <span className="info-value">{(prediction.remainingDistance / 1000).toFixed(1)} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {prediction.nearbyCity && (
                      <div className="city-info">
                        <div className="city-main">
                          <div className="city-icon">🏙️</div>
                          <div className="city-details">
                            <div className="city-name">
                              {prediction.nearbyCity.name}
                            </div>
                            <div className="city-country">
                              {prediction.nearbyCity.country}
                            </div>
                          </div>
                        </div>
                        <div className="city-distance">
                          <span className="distance-label">Расстояние от маршрута:</span>
                          <span className="distance-value">{prediction.nearbyCity.distance} km</span>
                        </div>
                      </div>
                    )}
                    
                    {!prediction.nearbyCity && prediction.type === 'prediction' && (
                      <div className="no-city-info">
                        <div className="no-city-icon">🌾</div>
                        <div className="no-city-text">Поблизости нет крупных городов</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoutePrediction;
