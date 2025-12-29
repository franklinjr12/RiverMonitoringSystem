import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const DemoSensorData = () => {
    const navigate = useNavigate();

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
                    toast.error(data["error"]);
                    return;
                }
                toast.success("Sensor data created");
                navigate('/devices', { replace: true });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [navigate]);

    return null;
}

export default DemoSensorData;