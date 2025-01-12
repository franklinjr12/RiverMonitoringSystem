import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import { useParams } from 'react-router-dom';

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
        fetch(`http://localhost:3000/device_configuration/index?device_id=${deviceId}`)
            .then(response => response.json())
            .then(data => setDeviceConfig(data))
            .catch(error => console.error('Error fetching device configuration:', error));
    }, []);

    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    const [deviceConfigOption, setDeviceConfigOption] = useState('');
    const handleDeviceConfigChange = (event) => {
        setDeviceConfigOption(event.target.value);
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
      };

    const handleSend = () => {
        console.log('Configuration option:', deviceConfigOption);
        console.log('Input value:', inputValue);
        console.log('current deviceConfig:', deviceConfig);
        fetch(`http://localhost:3000/device_configuration/create?device_id=${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                device_configuration: {
                    option: deviceConfigOption,
                    value: inputValue,
                }
            }),
        })
        .then(response => {
            if (response.ok) {
                alert('Configuration updated successfully!');
                handleClose();
            } else {
                alert('Failed to update configuration.');
            }
        })
        .catch(error => {
            console.error('Error updating configuration:', error);
            alert('Error updating configuration.');
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
                    <Button variant="contained" color="primary" onClick={handleSend}>
                        Send
                    </Button>
                </Box>
            </Modal>
        </div>
    )
}

export default DeviceConfiguration;