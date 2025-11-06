import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';

const DownloadGraphDataButton = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
      const handleDownloadData = async () => {
        try {
          const host = process.env.REACT_APP_BACKEND_HOST;
          let url = host + `/sensor_datum/index?device_id=${deviceId}`;
          if (startDate && endDate) {
            url += `&start_date=${startDate}&end_date=${endDate}`;
          }

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('sessionToken')
            }
          });

          const json = await response.json();
          if (!json[dataSource]) {
            console.error('Invalid data source:', dataSource);
            return;
          }

          const sensorData = json[dataSource].map(item => ({
            date: item.recorded_at,
            value: item.value
          }));

          const csv = sensorData.map(item => `${item.date};${item.value}`).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = `${dataSource}_data.csv`;
          a.click();
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      return (
        <button onClick={handleDownloadData} style={{ border: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
          <DownloadIcon />
        </button>
      )
}

export default DownloadGraphDataButton;