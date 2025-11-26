#ifndef SYSTEM_H
#define SYSTEM_H

#include "config.h"

#include <time.h>

#define TIME_STR_LEN 20

void panic(void);

int setup_storage(void);

int write_config(Config* conf);
int read_config(Config* conf);

int has_readings(unsigned int* readings_stored);
int write_sensor_readings(float level, float temperature, time_t at);
int read_sensor_readings(float* level_readings, float* temperature_readings, time_t* at_readings);

int sleep_for(unsigned long seconds);

int setup_time(void);
int current_time(time_t* time);
void format_time(time_t time, char* out);

int log_error(char* msg);
int log_info(char* msg);

#endif
