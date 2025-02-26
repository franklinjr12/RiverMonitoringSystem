import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getContext } from './ApplicationContext';
import moment from 'moment'

const SensorDataChart = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let url = getContext().BACKEND_HOST + `/sensor_datum/index?device_id=${deviceId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('sessionToken')
      }
    })
      .then(response => response.json())
      .then(data => {
        if (!data[dataSource]) {
          console.error('Invalid data source:', dataSource);
          return;
        }
        const sensorData = data[dataSource].map(item => ({
            date: new Date(item.recorded_at).getTime(),
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
        <XAxis dataKey="date" tickFormatter={(ts) => moment(ts).format("YYYY-MM-DD HH:mm:ss")} type="number" domain={['dataMin', 'dataMax']}/>
        <YAxis />
        <Tooltip labelFormatter={(label) => moment(label).format("YYYY-MM-DD HH:mm:ss")} />
        <Legend />
        <Line type="monotone" dataKey={dataSource} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SensorDataChart;