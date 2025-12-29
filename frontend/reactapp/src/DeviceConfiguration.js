import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ButtonLoadingSpinner } from './components/LoadingSpinner';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

const DeviceConfiguration = () => {

    const {deviceId} = useParams();

    const [deviceConfig, setDeviceConfig] = useState({});
    useEffect(() => {
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + `/device_configuration/index?device_id=${deviceId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('sessionToken')
            }
        })
            .then(response => response.json())
            .then(data => setDeviceConfig(data))
            .catch(error => console.error('Error fetching device configuration:', error));
    }, [deviceId]);

    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    const [deviceConfigOption, setDeviceConfigOption] = useState('');
    const handleDeviceConfigChange = (event) => {
        console.log('Device config option:', event.target);
        setDeviceConfigOption(event.target.value);
        setInputValue(deviceConfig[event.target.value]);
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
      };

    const handleSend = () => {
        setLoading(true);
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + `/device_configuration/create?device_id=${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('sessionToken')
            },
            body: JSON.stringify({
                device_configuration: {
                    option: deviceConfigOption,
                    value: inputValue,
                }
            }),
        })
        .then(response => {
            setLoading(false);
            if (response.ok) {
                toast.success('Configuration updated successfully!');
                handleClose();
            } else {
                toast.error('Failed to update configuration.');
            }
        })
        .catch(error => {
            console.error('Error updating configuration:', error);
            setLoading(false);
            toast.error('Error updating configuration.');
        });
    };

    return (
        <div>
            <AppSettingsAltIcon onClick={handleOpen}> </AppSettingsAltIcon>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Device configuration
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel id="device-config-input-label">Configuration</InputLabel>
                        <Select
                        labelId="device-config-select-label"
                        id="device-config-simple-select"
                        value={deviceConfigOption}
                        label="Configuration"
                        onChange={handleDeviceConfigChange}
                        >
                        <MenuItem value={'read'}>Sensor read frequency</MenuItem>
                        <MenuItem value={'upload'}>Data upload frequency</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="device-config-input"
                        label="Enter value"
                        variant="outlined"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <Button variant="contained" color="primary" onClick={handleSend} disabled={loading}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            {loading && <ButtonLoadingSpinner size={16} />}
                            {loading ? 'Sending...' : 'Send'}
                        </Box>
                    </Button>
                </Box>
            </Modal>
        </div>
    )
}

export default DeviceConfiguration;