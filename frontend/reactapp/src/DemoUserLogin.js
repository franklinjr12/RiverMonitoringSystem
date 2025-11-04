import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


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
                    alert(data["error"]);
                    return;
                }
                alert("Login successful");
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