#ifndef SYSTEM_H
#define SYSTEM_H

#include "config.h"

#include <time.h>

#define TIME_STR_LEN 20

void panic(void);

int setup_storage(void);
int write_kv(char* key, void* value, size_t value_size);
int read_kv(char* key, void* value, size_t value_size);

int write_config(Config* conf);
int read_config(Config* conf);

int has_readings(unsigned int* readings_stored);
int write_sensor_readings(float level, float temperature, time_t at);
int read_sensor_readings(float* level_readings, float* temperature_readings, time_t* at_readings);

int sleep_for(unsigned long seconds);

int setup_time(void);
int current_time(time_t* time);
int format_time_str(time_t time, char* out);
int format_time_tm(time_t time, struct tm* out_tm);
int write_last_upload_time(time_t in);
int read_last_upload_time(time_t* out);

int should_send_payload(Config* conf);

int log_error(char* msg);
int log_info(char* msg);
int log_info_f(char* fmt, ...);

#endif
