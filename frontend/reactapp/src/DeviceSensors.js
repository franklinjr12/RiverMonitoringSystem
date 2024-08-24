import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SensorDataChart from './SensorDataChart';
import HomeButton from './HomeButton';
import './DeviceSensors.css';

const DeviceSensors = () => {
  const { deviceId } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <div>
      <div className="header">
        <div className="home-button">
          <HomeButton />
        </div>
        <div className="date-pickers">
          <input 
            type="date" 
            value={startDate || ''} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
          <input 
            type="date" 
            value={endDate || ''} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
      </div>
      <h1>River level</h1>
      <SensorDataChart 
        dataSource="level" 
        deviceId={deviceId} 
        startDate={startDate} 
        endDate={endDate} 
      />
      <h1>Local temperature</h1>
      <SensorDataChart 
        dataSource="temperature" 
        deviceId={deviceId} 
        startDate={startDate} 
        endDate={endDate} 
      />
    </div>
  );
};

export default DeviceSensors;