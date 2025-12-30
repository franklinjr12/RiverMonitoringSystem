import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import NeumorphicButton from './NeumorphicButton';
import NeumorphicInput from './NeumorphicInput';
import { toast } from 'react-toastify';
import { ButtonLoadingSpinner } from './components/LoadingSpinner';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const host = process.env.REACT_APP_BACKEND_HOST;
    fetch(host + '/users/login', {
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
        setLoading(false);
        if (data["error"]) {
          toast.error(data["error"]);
          return;
        }
        toast.success("Login successful");
        localStorage.setItem('sessionToken', data["token"]);
        if (data["username"]) {
          localStorage.setItem('username', data["username"]);
        } else {
          localStorage.setItem('username', username);
        }
        if (data["user_id"]) {
          localStorage.setItem('userId', data["user_id"]);
        }
        navigate('/devices', { replace: true });
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  return (
    <Box m="10%">
      <Box display="flex">
        <Box flex={2}>
          <img src={`${process.env.PUBLIC_URL}/login_image.jpeg`} alt="Login" style={{ width: '100%', height: 'auto' }} />
        </Box>
        <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="flex-start">
          {loading ? (
            <Box display="flex" flexDirection="column" mb={2} style={{ width: '100%' }}>
              <Typography variant="h6" component="p" style={{ marginTop: '20px' }}>
                Loading...
              </Typography>
            </Box>
          ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', margin: '20px' }}>
            <Box display="flex" flexDirection="column" mb={2}>
              <NeumorphicInput
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </Box>
            <Box display="flex" flexDirection="column" mb={2}>
              <NeumorphicInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </Box>
            <NeumorphicButton type="submit" disabled={loading}>
              <Box display="flex" alignItems="center" justifyContent="center">
                {loading && <ButtonLoadingSpinner size={16} />}
                {loading ? 'Logging in...' : 'Log in'}
              </Box>
            </NeumorphicButton>
          </form>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default UserLogin;