// this screen should only show the following modules
// <SensorDataChart dataSource="level" />
// <SensorDataChart dataSource="temperature" />

import React from 'react';
import SensorDataChart from './SensorDataChart';
import { useParams } from 'react-router-dom';

const DeviceSensors = () => {
  const { deviceId } = useParams();
  return (
    <div>
      <SensorDataChart dataSource="level" deviceId={deviceId}/>
      <SensorDataChart dataSource="temperature" deviceId={deviceId}/>
    </div>
  );
};

export default DeviceSensors;