import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';
import moment from 'moment';
import { ChartSkeleton } from './components/LoadingSkeleton';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const SensorDataChart = ({ dataSource, deviceId, startDate = null, endDate = null }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alarms, setAlarms] = useState([]);
  const chartId = `chart-${dataSource}-${deviceId}`;

  const colors = {
    level: { stroke: '#2196F3', fill: 'url(#colorLevel)' },
    temperature: { stroke: '#FF9800', fill: 'url(#colorTemperature)' }
  };

  const chartColor = colors[dataSource] || colors.level;

  useEffect(() => {
    setLoading(true);
    const host = process.env.REACT_APP_BACKEND_HOST;
    let url = host + `/sensor_datum/index?device_id=${deviceId}`;
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }

    Promise.all([
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('sessionToken')
        }
      }),
      fetch(`${host}/alarm/index?device_id=${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('sessionToken')
        }
      })
    ])
      .then(([dataResponse, alarmsResponse]) => Promise.all([dataResponse.json(), alarmsResponse.json()]))
      .then(([data, alarmsData]) => {
        if (!data[dataSource]) {
          console.error('Invalid data source:', dataSource);
          setLoading(false);
          return;
        }
        const sensorData = data[dataSource].map(item => ({
          date: new Date(item.recorded_at).getTime(),
          [dataSource]: item.value
        }));
        setData(sensorData);

        const relevantAlarms = alarmsData.filter(alarm => {
          const condition = alarm.trigger_condition || '';
          return condition.toLowerCase().includes(dataSource.toLowerCase());
        });
        setAlarms(relevantAlarms);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [dataSource, deviceId, startDate, endDate]);

  const calculateStats = () => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = data.map(d => d[dataSource]).filter(v => v != null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, avg };
  };

  const stats = calculateStats();

  const handleExport = (format) => {
    const chartElement = document.querySelector(`#${chartId} svg`);
    if (!chartElement) return;

    if (format === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(chartElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataSource}-chart-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      const svgString = new XMLSerializer().serializeToString(chartElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${dataSource}-chart-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, 'image/png');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const parseAlarmValue = (alarm) => {
    const condition = alarm.trigger_condition || '';
    const match = condition.match(/([><=!]+)\s*([\d.]+)/);
    return match ? parseFloat(match[2]) : null;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {moment(label).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>
          <Typography variant="body2" sx={{ color: chartColor.stroke }}>
            {dataSource.charAt(0).toUpperCase() + dataSource.slice(1)}: {payload[0].value?.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return <ChartSkeleton height={400} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Min: {stats.min.toFixed(2)} | Max: {stats.max.toFixed(2)} | Avg: {stats.avg.toFixed(2)}
          </Typography>
        </Box>
        <ButtonGroup size="small" variant="outlined">
          <Button startIcon={<DownloadIcon />} onClick={() => handleExport('png')}>
            PNG
          </Button>
          <Button startIcon={<DownloadIcon />} onClick={() => handleExport('svg')}>
            SVG
          </Button>
        </ButtonGroup>
      </Box>
      <Box id={chartId}>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tickFormatter={(ts) => moment(ts).format("MM-DD HH:mm")}
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke="#666"
            />
            <YAxis
              stroke="#666"
              label={{ value: dataSource.charAt(0).toUpperCase() + dataSource.slice(1), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {alarms.map((alarm, index) => {
              const value = parseAlarmValue(alarm);
              return value != null ? (
                <ReferenceLine
                  key={index}
                  y={value}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: `Alarm: ${alarm.trigger_condition}`, position: 'topRight' }}
                />
              ) : null;
            })}
            <Area
              type="monotone"
              dataKey={dataSource}
              stroke={chartColor.stroke}
              fill={chartColor.fill}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Brush
              dataKey="date"
              height={30}
              tickFormatter={(ts) => moment(ts).format("MM-DD HH:mm")}
              stroke={chartColor.stroke}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SensorDataChart;