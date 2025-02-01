import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getContext } from './ApplicationContext';

const SensorDataChart = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let url = getContext().BACKEND_HOST + `/sensor_datum/index?device_id=${deviceId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data[dataSource]) {
          console.error('Invalid data source:', dataSource);
          return;
        }
        const sensorData = data[dataSource].map(item => ({
          date: item.recorded_at,
          [dataSource]: item.value
        }));
        setData(sensorData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [dataSource, deviceId, startDate, endDate]);

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