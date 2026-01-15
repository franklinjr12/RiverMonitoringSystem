import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import SensorDataChart from './SensorDataChart';
import DeviceConfiguration from './DeviceConfiguration';
import DeviceAlarms from './DeviceAlarms';
import DownloadGraphDataButton from './DownloadGraphDataButton';
import DateRangePicker from './components/DateRangePicker';
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
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DeviceConfiguration deviceId={deviceId} />
            <DeviceAlarms deviceId={deviceId} />
          </Box>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </Box>
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
      </Box>
    </div>
  );
};

export default Device;