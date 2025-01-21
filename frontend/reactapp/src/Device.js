import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import SensorDataChart from './SensorDataChart';
import HomeButton from './HomeButton';
import DeviceConfiguration from './DeviceConfiguration';
import DeviceAlarms from './DeviceAlarms';
import DownloadGraphDataButton from './DownloadGraphDataButton';
import './Device.css';

const Device = () => {
  const { deviceId } = useParams();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  return (
    <div>
      <div className="header">
        <div className="action-buttons" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <div className="home-button">
            <HomeButton />
          </div>
          <div className="settings-button" style={{ border: '1px solid black', padding: '5px', borderRadius: '5px' }}>
            <DeviceConfiguration
            deviceId={deviceId}
            />
          </div>
          <div className="alarms-button" style={{ border: '1px solid black', padding: '5px', borderRadius: '5px' }}>
            <DeviceAlarms
              deviceId={deviceId}
            />
          </div>
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
      <Box>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ textAlign: 'center', flex: 1 }}>River level</h1>
          <DownloadGraphDataButton 
            dataSource="level" 
            deviceId={deviceId} 
            startDate={startDate} 
            endDate={endDate}
          />
        </Box>
        <SensorDataChart 
          dataSource="level" 
          deviceId={deviceId} 
          startDate={startDate} 
          endDate={endDate} 
        />
      </Box>
      <Box>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ textAlign: 'center', flex: 1 }}>Local temperature</h1>
          <DownloadGraphDataButton 
            dataSource="temperature" 
            deviceId={deviceId} 
            startDate={startDate} 
            endDate={endDate}
          />
        </Box>
        <SensorDataChart 
          dataSource="temperature" 
          deviceId={deviceId} 
          startDate={startDate} 
          endDate={endDate} 
        />
      </Box>
    </div>
  );
};

export default Device;