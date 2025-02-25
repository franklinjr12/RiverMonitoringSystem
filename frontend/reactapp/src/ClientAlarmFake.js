
import React, { useEffect, useState } from 'react';
import { getContext } from './ApplicationContext';

const CLientAlarmFake = () => {
    const [alarms, setAlarms] = useState([]);

    useEffect(() => {
        fetch(getContext().BACKEND_HOST + '/alarm/index?device_id=1', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('sessionToken')
            }
        })
            .then(response => response.json())
            .then(data => setAlarms(data))
            .catch(error => console.error('Error fetching alarms:', error));
    }, []);

    return (
        <div>
            <h1>Alarms</h1>
            {alarms.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Alarm ID</th>
                            <th>Device ID</th>
                            <th>Location</th>
                            <th>Condition</th>
                            <th>Endpoint</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alarms.map(alarm => (
                            <tr key={alarm.id}>
                                <td>{alarm.id}</td>
                                <td>1</td>
                                <td>{alarm.location}</td>
                                <td>{alarm.condition}</td>
                                <td>{alarm.endpoint}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No alarms found.</p>
            )}
        </div>
    );
}

export default CLientAlarmFake;