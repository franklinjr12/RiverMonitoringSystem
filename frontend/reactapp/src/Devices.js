import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

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
        const color = statusColor[device.status];

        return (
          <Grid item xs={12} sm={6} md={4} key={device.id}>
            <Card
              sx={{ m: 2, p: 2, cursor: "pointer" }}
              onClick={() => handleCardClick(device.id)}
            >
              <CardContent>

                <Typography variant="h5" align="center">
                  {device.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 1 }}
                >
                  {device.location}
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
                    {device.status}
                  </Typography>
                </Box>

                <Typography variant="body2" align="center">
                  Last reading: {new Date(device.last_read_at).toLocaleString()}
                </Typography>

                <Typography variant="body2" align="center">
                  Level: {device.last_level}m | Temp: {device.last_temperature}°C
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
      {loading ? (
        <Typography variant="h6" component="p" style={{ marginTop: '20px' }}>
          Loading...
        </Typography>
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