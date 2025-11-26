#include "config.h"
#include "errors.h"
#include "internet_interface.h"
#include "json_builder.h"
#include "sensor_interface.h"
#include "system.h"

#include <stdio.h>
#include <string.h>

void setup() {
    int ret;
    
    ret = setup_config();
    if (ret != NO_ERROR) {
        panic();
    }
    
    ret = setup_storage();
    if (ret != NO_ERROR) {
        panic();
    }
    log_info("Initiating device\0");

    ret = read_config(&config);
    if (ret != NO_ERROR) {
        log_error("Error reading config\0");
        panic();
    }
    
    ret = init_level_sensor();
    if (ret != NO_ERROR) {
        log_error("Error initiating level sensor\0");
    }
    
    ret = init_temperature_sensor();
    if (ret != NO_ERROR) {
        log_error("Error initiating temperature sensor\0");
    }
    
    ret = setup_time();
    if (ret != NO_ERROR) {
        log_error("Error setting up time\0");
    }
}

void loop() {
    int ret = 0;
    float level_reading = 0;
    float temperature_reading = 0;

    ret = read_level_sensor(&level_reading);
    if (ret != NO_ERROR) {
        log_error("Error reading level sensor\0");
    }

    ret = read_temperature_sensor(&temperature_reading);
    if (ret != NO_ERROR) {
        log_error("Error reading level sensor\0");
    }

    time_t now;
    ret = current_time(&now);
    if (ret != NO_ERROR) {
        log_error("Error current time\0");
    }
    char time_str[TIME_STR_LEN];
    format_time(now, time_str);

    const int buffer_size = 512;
    char buffer[buffer_size];
    ret = build_reading(level_reading, temperature_reading, time_str, buffer);
    if (ret != NO_ERROR) {
        log_error("Error building json\0");
    }

    // need to check if should send to server before sending

    ret = connect_to_server(&config);
    if (ret != NO_ERROR) {
        log_error("Error connecting to server\0");
    } else {
        buffer[strlen(buffer)-1] = '\0'; // to remove last comma
        char payload_buffer[buffer_size];
        sprintf(payload_buffer, "{\"payload\":[%s]}", buffer);
        ret = send_payload(payload_buffer);
        if (ret != NO_ERROR) {
            log_error("Error on sending data to server\0");
        }
        sleep_for(config.sensor_read_interval_seconds);
    }
}
