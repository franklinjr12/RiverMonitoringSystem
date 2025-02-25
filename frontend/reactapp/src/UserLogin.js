import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { getContext } from './ApplicationContext';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(getContext().BACKEND_HOST + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          username: username,
          password: password,
        }
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          alert(data["error"]);
          return;
        }
        alert("Login successful");
        localStorage.setItem('sessionToken', data["token"]);
        window.location.href = '/devices';
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <Box m="10%">
      <Box display="flex">
        <Box flex={2}>
          <img src="/login_image.jpeg" alt="Login" style={{ width: '100%', height: 'auto' }} />
        </Box>
        <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="flex-start">
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box display="flex" flexDirection="column" mb={2}>
              <label>
                Username:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            </Box>
            <Box display="flex" flexDirection="column" mb={2}>
              <label>
                Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </Box>
            <button type="submit">Log in</button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export default UserLogin;