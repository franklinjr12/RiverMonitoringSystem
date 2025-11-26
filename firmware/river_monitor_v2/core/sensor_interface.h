#ifndef SENSOR_INTERFACE_H
#define SENSOR_INTERFACE_H

int init_level_sensor();
int read_level_sensor(float* out);
int init_temperature_sensor();
int read_temperature_sensor(float* out);

#endif
