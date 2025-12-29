import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { ChartSkeleton } from './components/LoadingSkeleton';

const SensorDataChart = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const host = process.env.REACT_APP_BACKEND_HOST;
    let url = host + `/sensor_datum/index?device_id=${deviceId}`;
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
          setLoading(false);
          return;
        }
        const sensorData = data[dataSource].map(item => ({
            date: new Date(item.recorded_at).getTime(),
            [dataSource]: item.value
          }));
        setData(sensorData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [dataSource, deviceId, startDate, endDate]);

  if (loading) {
    return <ChartSkeleton height={400} />;
  }

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