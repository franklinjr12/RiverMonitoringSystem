#ifndef CONFIG_H
#define CONFIG_H

typedef struct {
    unsigned int sensor_read_interval_seconds;
    unsigned int upload_interval_seconds;
    char* host;
    unsigned int port;
    char* resource_path;
    unsigned long device_id;
    unsigned long level_sensor_id;
    unsigned long temperature_sensor_id;
}Config;

extern Config config;

int setup_config();

#endif
