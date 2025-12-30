import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ size = 24, color = 'primary' }) => {
  return (
    <Box display="inline-flex" alignItems="center" justifyContent="center">
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

const ButtonLoadingSpinner = ({ size = 20 }) => {
  return (
    <Box display="inline-flex" alignItems="center" mr={1}>
      <CircularProgress size={size} sx={{ color: 'white' }} />
    </Box>
  );
};

export { LoadingSpinner, ButtonLoadingSpinner };


