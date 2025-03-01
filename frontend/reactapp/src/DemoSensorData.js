import React, { useState, useEffect } from 'react';

const DemoSensorData = () => {

    useEffect(() => {
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + '/demo/create_sensor_data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('sessionToken')
            }
          })
            .then((response) => response.json())
            .then((data) => {
                if (data["error"]) {
                    alert(data["error"]);
                    return;
                }
                alert("Sensor data created");
                window.location.href = '/devices';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);
}

export default DemoSensorData;