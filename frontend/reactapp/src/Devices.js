import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const host = process.env.REACT_APP_BACKEND_HOST;
    fetch(`${host}/device/index`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('sessionToken')
      }
    })
      .then(response => response.json())
      .then(data => setDevices(data))
      .catch(error => console.error('Error fetching devices:', error));
  }, []);

  const handleCardClick = (deviceId) => {
    navigate(`/device-sensors/${deviceId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  }

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6">River Monitoring System</Typography>
        <button style={{ padding: '10px', cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
      </nav>
      {devices.length > 0 ? (
        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          {devices.map(device => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <Card 
                style={{ margin: '20px', padding: '20px', cursor: 'pointer' }} 
                onClick={() => handleCardClick(device.id)}
              >
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {device.name}
                  </Typography>
                  <Typography color="textSecondary">
                    Location: {device.location}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" component="p" style={{ marginTop: '20px' }}>
          No devices found.
        </Typography>
      )}
    </div>
  );
};

export default Devices;