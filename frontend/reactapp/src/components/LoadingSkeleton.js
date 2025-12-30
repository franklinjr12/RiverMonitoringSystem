import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

const DeviceCardSkeleton = () => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ m: 2, p: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mx: 'auto', mb: 2 }} />
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <Skeleton variant="circular" width={10} height={10} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>
          <Skeleton variant="text" width="90%" height={20} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="85%" height={20} sx={{ mx: 'auto' }} />
        </CardContent>
      </Card>
    </Grid>
  );
};

const DeviceCardsSkeleton = ({ count = 6 }) => {
  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <DeviceCardSkeleton key={index} />
      ))}
    </Grid>
  );
};

const ChartSkeleton = ({ height = 400 }) => {
  return (
    <Box sx={{ width: '100%', height: height, p: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={height - 40} sx={{ mb: 2, borderRadius: 1 }} />
      <Box display="flex" justifyContent="space-between">
        <Skeleton variant="text" width={100} height={24} />
        <Skeleton variant="text" width={100} height={24} />
      </Box>
    </Box>
  );
};

export { DeviceCardSkeleton, DeviceCardsSkeleton, ChartSkeleton };


