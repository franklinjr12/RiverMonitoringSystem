#include "config.h"
#include "errors.h"

#include <string.h>

#define HOST_BUFFER_SIZE 100
// const int host_buffer_size = 100;
char host_buffer[HOST_BUFFER_SIZE];
char resource_path_buffer[HOST_BUFFER_SIZE];
Config config;

int setup_config() {
    memset(host_buffer, '\0', HOST_BUFFER_SIZE);
    memset(resource_path_buffer, '\0', HOST_BUFFER_SIZE);
    config.host = host_buffer;
    config.resource_path = resource_path_buffer;
    return NO_ERROR;
}