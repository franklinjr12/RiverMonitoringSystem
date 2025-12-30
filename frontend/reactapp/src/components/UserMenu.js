import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const loadUserInfo = () => {
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId');
      
      if (username || userId) {
        setUserInfo({
          username: username || undefined,
          id: userId || undefined
        });
      } else {
        const host = process.env.REACT_APP_BACKEND_HOST;
        const token = localStorage.getItem('sessionToken');
        
        if (!token) return;

        fetch(`${host}/users/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          return null;
        })
        .then(data => {
          if (data) {
            setUserInfo(data);
            if (data.username) {
              localStorage.setItem('username', data.username);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
        });
      }
    };

    loadUserInfo();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
    handleClose();
  };

  const displayName = userInfo?.username || userInfo?.email || 'User';

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          {userInfo?.email && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {userInfo.email}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;

