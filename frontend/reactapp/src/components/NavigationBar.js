import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SensorsIcon from '@mui/icons-material/Sensors';
import UserMenu from './UserMenu';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const isDeviceDetailPage = location.pathname.includes('/device-sensors/');

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      <Link
        key="home"
        component="button"
        variant="body1"
        onClick={() => navigate('/devices')}
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
          cursor: 'pointer',
        }}
      >
        Devices
      </Link>
    ];

    if (isDeviceDetailPage && params.deviceId) {
      breadcrumbs.push(
        <Typography key="device" variant="body1" color="text.primary">
          Device {params.deviceId}
        </Typography>
      );
    }

    return breadcrumbs;
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        River Monitoring
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/devices')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (isLoginPage) {
    return null;
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box
            component="button"
            onClick={() => navigate('/devices')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              mr: 3,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <SensorsIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              River Monitoring System
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && isDeviceDetailPage && (
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                mr: 3,
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'nowrap',
                },
              }}
            >
              {getBreadcrumbs()}
            </Breadcrumbs>
          )}

          <UserMenu />
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default NavigationBar;

