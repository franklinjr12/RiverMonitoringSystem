
import React, { useEffect, useState } from 'react';

const CLientAlarmFake = () => {
    const [alarms, setAlarms] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/alarm/index?device_id=1')
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
                            <th>Device ID</th>
                            <th>Condition</th>
                            <th>Endpoint</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alarms.map(alarm => (
                            <tr key={alarm.id}>
                                <td>{1}</td>
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