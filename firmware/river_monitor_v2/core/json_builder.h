#ifndef JSON_BUILDER_H
#define JSON_BUILDER_H

#include <time.h>

// {"sensor_id":00000001,"value":003.02,"recorded_at":"2025-12-03 13:24:42"},{"sensor_id":00000002,"value":015.92,"recorded_at":"2025-12-03 13:24:42"},
# define BUILD_READING_MAX_SIZE 149

int build_reading(float level, float temperature, char* at, char* out);

#endif
