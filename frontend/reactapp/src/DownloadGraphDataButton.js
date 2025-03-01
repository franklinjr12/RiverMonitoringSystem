import React, { useState, useEffect } from 'react';
import DownloadIcon from '@mui/icons-material/Download';

const DownloadGraphDataButton = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
      const [data, setData] = useState([]);
    
      useEffect(() => {
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

      const downloadData = () => {
        const csv = data.map(item => `${item.date};${item[dataSource]}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataSource}_data.csv`;
        a.click();
      }

      return (
        <button onClick={downloadData} style={{ border: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
          <DownloadIcon />
        </button>
      )
}

export default DownloadGraphDataButton;