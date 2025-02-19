import React, { useState, useEffect } from 'react';
import { getContext } from './ApplicationContext';

const DemoSensorData = () => {

    useEffect(() => {
        fetch(getContext().BACKEND_HOST + '/demo/create_sensor_data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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