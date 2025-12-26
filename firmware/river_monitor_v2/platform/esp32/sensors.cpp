#include "sensor_interface.h"

#include <Arduino.h>

int init_level_sensor(){
    return 0;
}

int read_level_sensor(float* out){
    float min = 2;
    float max = 5;
    float seed = micros();
    float decimal_factor = 10;
    float allowed_range = (max - min) * decimal_factor;
    float value = (((int)seed % (int)allowed_range) / decimal_factor + min);
    value > max ? (*out) = max : (*out) = value;
    return 0;
}

int init_temperature_sensor(){
    return 0;
}

int read_temperature_sensor(float* out){
    float min = 15;
    float max = 35;
    float seed = micros();
    float decimal_factor = 10;
    float allowed_range = (max - min) * decimal_factor;
    float value = (((int)seed % (int)allowed_range) / decimal_factor + min);
    value > max ? (*out) = max : (*out) = value;
    return 0;
}    
