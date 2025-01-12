import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SensorDataChart from './SensorDataChart';
import HomeButton from './HomeButton';
import DeviceConfiguration from './DeviceConfiguration';
import './DeviceSensors.css';

const DeviceSensors = () => {
  const { deviceId } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDeviceConfig = () => {
    console.log('Device configuration');
  };

  return (
    <div>
      <div className="header">
        <div className="home-button">
          <HomeButton />
        </div>
        <div className="settings-button" style={{ border: '1px solid black', padding: '5px', borderRadius: '5px' }}>
          <DeviceConfiguration
          deviceId={deviceId}
          />
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