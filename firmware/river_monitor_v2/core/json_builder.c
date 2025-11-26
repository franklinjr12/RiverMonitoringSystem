#include "config.h"
#include "errors.h"
#include "json_builder.h"

#include <stdio.h>
#include <string.h>

int build_reading(float level, float temperature, char* at, char* out) {
    const int buffer_size = 512;
    char buffer[buffer_size];
    char* format = "{\"sensor_id\":%ld,\"value\":%2.02f,\"recorded_at\":\"%s\"},{\"sensor_id\":%ld,\"value\":%2.02f,\"recorded_at\":\"%s\"},\0";
    int bytes_written = sprintf(buffer,
        format,
        config.level_sensor_id,
        level,
        at,
        config.temperature_sensor_id,
        temperature,
        at
    );

    // memcpy(out, buffer, bytes_written);
    strcpy(out, buffer);

    return NO_ERROR;
}
