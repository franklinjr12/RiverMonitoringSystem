import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import { DeviceCardsSkeleton } from './components/LoadingSkeleton';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const host = process.env.REACT_APP_BACKEND_HOST;
    fetch(`${host}/device/index`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('sessionToken')
      }
    })
      .then(response => response.json())
      .then(data => {
        setDevices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching devices:', error);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (deviceId) => {
    navigate(`/device-sensors/${deviceId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  }

  const statusColor = {
    online: "#4caf50",   // green
    delayed: "#ffb300",  // yellow
    offline: "#f44336"   // red
  };

  const DeviceCard = ({ devices }) => {
    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {devices.map((device) => {
          const statusText = device.status || 'unknown';
          const color = statusColor[device.status] || '#9e9e9e'; // default grey

          const hasLastReadAt = !!device.last_read_at;
          const lastReadText = hasLastReadAt
            ? new Date(device.last_read_at).toLocaleString()
            : 'No recent readings';

          const hasLevel = device.last_level !== null && device.last_level !== undefined;
          const hasTemperature = device.last_temperature !== null && device.last_temperature !== undefined;

          const levelText = hasLevel ? `${device.last_level}m` : 'N/A';
          const temperatureText = hasTemperature ? `${device.last_temperature}°C` : 'N/A';

          return (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <Card
                sx={{ m: 2, p: 2, cursor: "pointer" }}
                onClick={() => handleCardClick(device.id)}
              >
                <CardContent>

                  <Typography variant="h5" align="center">
                    {device.name || 'Unnamed device'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 1 }}
                  >
                    {device.location || 'Location not specified'}
                  </Typography>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: color,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                      {statusText}
                    </Typography>
                  </Box>

                  <Typography variant="body2" align="center">
                    Last reading: {lastReadText}
                  </Typography>

                  <Typography variant="body2" align="center">
                    Level: {levelText} | Temp: {temperatureText}
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };


  return (
    <Box>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6">River Monitoring System</Typography>
        <button style={{ padding: '10px', cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
      </nav>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {loading ? (
        <DeviceCardsSkeleton count={6} />
      ) : devices.length > 0 ? (
        <DeviceCard devices={devices}/>
      ) : (
        <Typography variant="h6" component="p" style={{ marginTop: '20px' }}>
          No devices found.
        </Typography>
      )}
    </Box>
  );
};

export default Devices;