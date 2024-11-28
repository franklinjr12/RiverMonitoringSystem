// 1
// create a screen that will display all devices as a grid of cards
// they fetch the data from http://localhost:3000/device/index?user_id=1
// which comes on the format: { devices: [{ id: 1, name: 'Device 1', location: 'river 1' }, { id: 2, name: 'Device 2', location: 'river 2' }] }

// 2
// actually it somes in this formart: [{ id: 1, name: 'Device 1', location: 'river 1' }, { id: 2, name: 'Device 2', location: 'river 2' }]

// 3
// make so that the cards are clicable and when clicked they will navigate to the DeviceSensors screen passing the device id as a parameter

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    fetch('http://localhost:3000/device/index?user_id=' + userId)
      .then(response => response.json())
      .then(data => setDevices(data))
      .catch(error => console.error('Error fetching devices:', error));
  }, []);

  const handleCardClick = (deviceId) => {
    navigate(`/device-sensors/${deviceId}`);
  };

  return (
    <div>
      {devices.length > 0 ? (
        <Grid container spacing={3}>
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
        <Typography variant="h6" component="p">
          No devices found.
        </Typography>
      )}
    </div>
  );
};

export default Devices;