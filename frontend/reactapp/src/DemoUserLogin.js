import React, { useState, useEffect } from 'react';
import { getContext } from './ApplicationContext';

const DemoUserLogin = () => {

    useEffect(() => {
        fetch(getContext().BACKEND_HOST + '/demo/index', {
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
                window.location.href = '/devices';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);
}

export default DemoUserLogin;