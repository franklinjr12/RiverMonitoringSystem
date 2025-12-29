import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const DemoUserLogin = () => {
  const navigate = useNavigate();

    useEffect(() => {
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + '/demo/index', {
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
                toast.success("Login successful");
                localStorage.setItem('userId', data["id"]);
                navigate('/devices', { replace: true });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [navigate]);

    return null;
}

export default DemoUserLogin;