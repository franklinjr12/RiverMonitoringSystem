import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SensorDataChart = ({ dataSource, deviceId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/sensor_datum/index?device_id=${deviceId}`)	
      .then(response => response.json())
      .then(data => {
        const sensorData = data[dataSource].map(item => ({
          date: item.recorded_at,
          [dataSource]: item.value
        }));
        setData(sensorData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [dataSource]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataSource} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SensorDataChart;