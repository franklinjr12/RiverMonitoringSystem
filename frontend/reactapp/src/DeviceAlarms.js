import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ButtonLoadingSpinner } from './components/LoadingSpinner';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const DeviceAlarms = () => {

    const {deviceId} = useParams();
    const [open, setOpen] = useState(false);
    const [showAlarmCreation, setShowAlarmCreation] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
        setShowAlarmCreation(false);
    }
    const [type, setType] = useState('');
    const [condition, setCondition] = useState('');
    const [value, setValue] = useState('');
    const [notificationEndpoint, setNotificationEndpoint] = useState('');
    const [loading, setLoading] = useState(false);

    const types = ['level', 'temperature'];
    const conditions = ['>', '<', '>=', '<=', '==', '!='];

    function buildTriggerCondition() {
        if (type === '' && condition === '' && value === '') {
            return '';
        }
        return `${type} ${condition} ${value}`;
    }

    const [deviceAlarms, setDeviceAlarms] = useState('');
    useEffect(() => {
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + `/alarm/index?device_id=${deviceId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('sessionToken')
            }
        })
            .then(response => response.json())
            .then(data => setDeviceAlarms(data.map(alarm => JSON.stringify(alarm)).join('\n\n').replace(/":/g, '": ').replace(/",/g, '", ').replace(/[{}]/g, '')))
            .catch(error => console.error('Error fetching device alarms:', error));
    }, [deviceId]);

    const handleSend = () => {
        console.log('Trigger condition:', buildTriggerCondition());
        if (type === '' || condition === '' || value === '') {
            toast.warning('Please enter all fields.');
            return;
        }
        setLoading(true);
        const host = process.env.REACT_APP_BACKEND_HOST;
        fetch(host + `/alarm/create?device_id=${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('sessionToken')
            },
            body: JSON.stringify({
                trigger_condition: buildTriggerCondition(),
                notification_endpoint: notificationEndpoint,
            }),
        })
        .then(response => {
            setLoading(false);
            if (response.ok) {
                toast.success('Alarm created!');
                handleClose();
            } else {
                toast.error('Failed to create alarm.');
            }
        })
        .catch(error => {
            console.error('Error creating alarm:', error);
            setLoading(false);
            toast.error('Failed to create alarm.');
        });
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        if (/^-?\d*\.?\d*$/.test(value)) {
            setValue(value);
        }
    }

    const handleShowAlarmCreation = () => {
        setType('');
        setCondition('');
        setValue('');
        setNotificationEndpoint('');
        setShowAlarmCreation(true);
    }

    const handleNotificationEndpointInputChange = (event) => {
        setNotificationEndpoint(event.target.value);
    }

    return (
        <div>
            <AccessAlarmIcon onClick={handleOpen}> </AccessAlarmIcon>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Device Alarms
                    </Typography>
                    {!showAlarmCreation && (
                        <Button variant="contained" color="primary" onClick={handleShowAlarmCreation}>
                            Create Alarm
                        </Button>
                    )}
                    {showAlarmCreation && (
                        <Box mt={2}>
                            <Box mt={2} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap={2}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="type-select-label">Type</InputLabel>
                                    <Select
                                        labelId="type-select-label"
                                        id="type-select"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        {types.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="condition-select-label">Condition</InputLabel>
                                    <Select
                                        labelId="condition-select-label"
                                        id="condition-select"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                    >
                                        {conditions.map((condition) => (
                                            <MenuItem key={condition} value={condition}>
                                                {condition}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="value-input"
                                    label="Value"
                                    variant="outlined"
                                    value={value}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
                                <TextField
                                    margin="normal"
                                    id="alarm-condition"
                                    variant="outlined"
                                    rows={1}
                                    value={(buildTriggerCondition() !== '') ? buildTriggerCondition() : 'Alarm condition'}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    id="alarm-endpoint-input"
                                    label="Endpoint"
                                    variant="outlined"
                                    value={notificationEndpoint}
                                    onChange={handleNotificationEndpointInputChange}
                                />
                                <Button variant="contained" color="primary" onClick={handleSend} disabled={loading}>
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        {loading && <ButtonLoadingSpinner size={16} />}
                                        {loading ? 'Creating...' : 'Create Alarm'}
                                    </Box>
                                </Button>
                            </Box>
                        </Box>
                    )}
                    <Box mt={2}>
                        <Typography variant="body1">Existing Alarms</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="existing-alarms"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={deviceAlarms}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default DeviceAlarms;