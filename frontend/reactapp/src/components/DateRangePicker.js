import { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const applyPreset = (preset) => {
    const today = moment();
    let start, end;

    switch (preset) {
      case 'last7days':
        start = moment().subtract(7, 'days');
        end = today;
        break;
      case 'last30days':
        start = moment().subtract(30, 'days');
        end = today;
        break;
      case 'thisMonth':
        start = moment().startOf('month');
        end = today;
        break;
      case 'lastMonth':
        start = moment().subtract(1, 'month').startOf('month');
        end = moment().subtract(1, 'month').endOf('month');
        break;
      case 'last3Months':
        start = moment().subtract(3, 'months');
        end = today;
        break;
      case 'last6Months':
        start = moment().subtract(6, 'months');
        end = today;
        break;
      case 'thisYear':
        start = moment().startOf('year');
        end = today;
        break;
      default:
        return;
    }

    onStartDateChange(start.format('YYYY-MM-DD'));
    onEndDateChange(end.format('YYYY-MM-DD'));
    handleClose();
  };

  const presets = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Last month', value: 'lastMonth' },
    { label: 'Last 3 months', value: 'last3Months' },
    { label: 'Last 6 months', value: 'last6Months' },
    { label: 'This year', value: 'thisYear' },
  ];

  const startMoment = startDate ? moment(startDate) : null;
  const endMoment = endDate ? moment(endDate) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          onClick={handleClick}
          sx={{ minWidth: 150 }}
        >
          Quick Presets
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {presets.map((preset) => (
            <MenuItem key={preset.value} onClick={() => applyPreset(preset.value)}>
              {preset.label}
            </MenuItem>
          ))}
        </Menu>

        <DatePicker
          label="Start Date"
          value={startMoment}
          onChange={(newValue) => {
            if (newValue) {
              onStartDateChange(newValue.format('YYYY-MM-DD'));
            }
          }}
          maxDate={endMoment || moment()}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{ width: 180 }}
            />
          )}
        />

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          to
        </Typography>

        <DatePicker
          label="End Date"
          value={endMoment}
          onChange={(newValue) => {
            if (newValue) {
              onEndDateChange(newValue.format('YYYY-MM-DD'));
            }
          }}
          minDate={startMoment}
          maxDate={moment()}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{ width: 180 }}
            />
          )}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;

