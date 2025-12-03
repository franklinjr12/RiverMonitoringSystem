#include "config.h"
#include "errors.h"
#include "internet_interface.h"
#include "json_builder.h"
#include "sensor_interface.h"
#include "system.h"

#include <stdio.h>
#include <string.h>

// helper function
int _send_payload(char* readings_buffer_ptr);

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

    // check if should send to server before sending
    time_t last_upload = 0;
    read_last_upload_time(&last_upload);

    double time_diff_seconds = difftime(now, last_upload);

    log_info_f("now %ld last %ld diff %f upload_interval %ld\n", now, last_upload, time_diff_seconds, config.upload_interval_seconds);

    if (time_diff_seconds >= (double)config.upload_interval_seconds) {
        log_info("Connecting to server");
        ret = connect_to_server(&config);
        if (ret != NO_ERROR) {
            log_error("Error connecting to server\0");
        } else {
            // build data format
            char time_str[TIME_STR_LEN];
            format_time_str(now, time_str);

            const int buffer_size = 512;
            char buffer[buffer_size];
            ret = build_reading(level_reading, temperature_reading, time_str, buffer);
            if (ret != NO_ERROR) {
                log_error("Error building json");
            }
            char* readings_buffer_ptr = buffer;

            // append existing readings if they exist
            log_info("checking existing readings");
            unsigned int existing_readings_count;
            ret = has_readings(&existing_readings_count);
            if (ret == NO_ERROR && existing_readings_count > 0) {
                log_info_f("readings count %d\n", existing_readings_count);
                float level_readings[existing_readings_count];
                float temperature_readings[existing_readings_count];
                time_t time_readings[existing_readings_count];
                ret = read_sensor_readings(level_readings, temperature_readings, time_readings);
                if (ret == NO_ERROR) {
                    char readings_json[existing_readings_count + 1][BUILD_READING_MAX_SIZE];
                    for (int i = 0; i < existing_readings_count - 1; i++) {
                        char reading_time_str[TIME_STR_LEN];
                        format_time_str(time_readings[i], reading_time_str);
                        ret = build_reading(level_readings[i], temperature_readings[i], reading_time_str, &readings_json[i][0]);
                        if (ret != NO_ERROR) {
                            log_error("Error building json");
                        }
                    }
                    // append last reading
                    strcpy(&readings_json[existing_readings_count][0], buffer);

                    ret = _send_payload(readings_buffer_ptr);
                    if (ret == NO_ERROR) {
                        log_info("Clearing readings");
                        clear_readings();
                    } else {
                        log_error("Error on sending data to server");
                    }
                } else {
                    log_error("getting existing readings");
                }
            } else {
                log_error("checking existing readings");
                ret = _send_payload(readings_buffer_ptr);
                if (ret != NO_ERROR) {
                    log_error("Error on sending data to server");
                }
            }
            write_last_upload_time(now);
        }
    } else {
        log_info("save readings to file");
        ret = write_sensor_readings(level_reading, temperature_reading, now);
        if (ret != NO_ERROR) {
            log_error("saving sensor readings");
        }
    }

    log_info("sleeping");
    sleep_for(config.sensor_read_interval_seconds);
}

int _send_payload(char* readings_buffer_ptr) {
    log_info_f("sending payload of size %d\n", strlen(readings_buffer_ptr));
    readings_buffer_ptr[strlen(readings_buffer_ptr)-1] = '\0'; // to remove last comma
    const int extra_payload_chars_count = 16;
    const int total_payload_size = strlen(readings_buffer_ptr) + extra_payload_chars_count;
    char payload_buffer[total_payload_size];
    sprintf(payload_buffer, "{\"payload\":[%s]}", readings_buffer_ptr);
    return send_payload(payload_buffer);
}
