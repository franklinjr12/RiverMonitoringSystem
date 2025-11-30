#include "../../core/errors.h"
#include "../../core/internet_interface.h"
#include "../../core/system.h"
#include "../../core/sensor_interface.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <curl/curl.h>
#include <time.h>
#include <errno.h>

//
// FILE PATHS FOR LINUX SIMULATION
//
static const char* STORAGE_FILE = "readings.csv";
static const char* CONFIG_FILE  = "config.bin";
static const char* KV_FILE  = "kv.bin";

//
// ─────────────────────────────────────────────────────────────
//   SYSTEM IMPLEMENTATION
// ─────────────────────────────────────────────────────────────
//

void panic(void) {
    fprintf(stderr, "PANIC: unrecoverable error\n");
    exit(1);
}

int setup_storage(void) {
    // Create file if not exists
    FILE* f = fopen(STORAGE_FILE, "a+");
    if (!f) return -1;
    fclose(f);
    f = fopen(KV_FILE, "a+b");
    if (!f) return -1;
    fclose(f);
    return NO_ERROR;
}

int write_kv(char* key, void* value, size_t value_size) {
    // take file size
    FILE* f = fopen(KV_FILE, "a");
    if (!f) return -1;
    int file_size = (int)ftell(f);
    fclose(f);
    printf("Filesize: %d\n", file_size);

    // create temp file
    char str_buffer[50];
    sprintf(str_buffer, "%s.temp", KV_FILE);
    FILE* f_temp = fopen(str_buffer, "w");
    if (!f_temp) {
        fclose(f);
        return -1;
    }


    // search if the key exists and write to new one
    f = fopen(KV_FILE, "rb");
    if (!f) return -1;
    const size_t buffer_size = 256;
    char line_buffer[buffer_size];
    char read_byte;
    int buffer_pos = 0;

    for(int i = 0; i < file_size; i++) {
        read_byte = fgetc(f);
        fputc(read_byte, f_temp);
        if (read_byte == '\n') {
            buffer_pos = 0;
        } else if (read_byte == '=') {
            line_buffer[buffer_pos] = '\0';
            // check key match
            if(!strcmp(key, line_buffer)) {
                // write the new value
                char* value_ptr = (char*)value;
                for(int j = 0; j < value_size; j++) {
                    fputc(value_ptr[j], f_temp);
                }
                fputc('\0', f_temp);
                fputc('\n', f_temp);

                // find the next line in the original file
                for(; i < file_size; i++) {
                    read_byte = fgetc(f);
                    if(read_byte == '\n') {
                        i++;
                        break;
                    }
                }

                // finish writing the file
                for(; i < file_size; i++) {
                    read_byte = fgetc(f);
                    fputc(read_byte, f_temp);
                }
                fclose(f_temp);
                fclose(f);
                remove(KV_FILE);
                rename(str_buffer, KV_FILE);
                return NO_ERROR;
            }
        } else {
            line_buffer[buffer_pos] = read_byte;
            buffer_pos++;
        }
    }

    // got to the end of the file so the key does not exist
    if (file_size == (int)ftell(f)) {
        printf("reached end of file\n");
        fclose(f);
        f = fopen(KV_FILE, "ab");

        fputs(key, f);
        fputc('=', f);
        char* value_ptr = (char*)value;
        for(int i = 0; i < value_size; i++) {
            fputc(value_ptr[i], f);
        }
        fputc('\0', f);
        fputc('\n', f);
    }

    fclose(f_temp);
    fclose(f);
    return NO_ERROR;
}

int read_kv(char* key, void* value, size_t value_size) {
    FILE* f = fopen(KV_FILE, "a");
    if (!f) return -1;
    int file_size = (int)ftell(f);
    fclose(f);

    f = fopen(KV_FILE, "rb");
    if (!f) return -1;
    const size_t buffer_size = 256;
    char line_buffer[buffer_size];
    char read_byte;
    int buffer_pos = 0;

    for(int i = 0; i < file_size; i++) {
        read_byte = fgetc(f);
        if (read_byte == '\n') {
            buffer_pos = 0;
        } else if (read_byte == '=') {
            line_buffer[buffer_pos] = '\0';
            if(!strcmp(key, line_buffer)) {
                buffer_pos = 0;
                i++;
                char* value_ptr = (char*)value;
                for(int j = 0; j < value_size; j++) {
                    read_byte = fgetc(f);
                    if (read_byte == '\n') break;
                    value_ptr[j] = read_byte;
                }
                break;
            }
        } else {
            line_buffer[buffer_pos] = read_byte;
            buffer_pos++;
        }
    }

    
    fclose(f);
    return NO_ERROR;
    return NO_ERROR;
}


//
// CONFIG I/O
//
int write_config(Config* conf) {
    FILE* f = fopen(CONFIG_FILE, "w");
    if (!f) return -1;

    fprintf(f,
        "%u\n"      // sensor_read_interval_seconds
        "%u\n"      // upload_interval_seconds
        "%s\n"      // host
        "%u\n"      // port
        "%lu\n"     // device_id
        "%lu\n"     // level_sensor_id
        "%lu\n",    // temperature_sensor_id
        conf->sensor_read_interval_seconds,
        conf->upload_interval_seconds,
        conf->host,
        conf->port,
        conf->device_id,
        conf->level_sensor_id,
        conf->temperature_sensor_id
    );

    fclose(f);
    return NO_ERROR;
}

int read_config(Config* conf) {
    printf("reading config\n");
    FILE* f = fopen(CONFIG_FILE, "r");
    if (!f) {
        printf("config does not exist. creating new one\n");
        // config file missing → write defaults already contained in *conf
        return write_config(conf);
    }

    char host_buf[256];
    char resource_buf[256];
    // memset(host_buf, '\0', 256);
    
    printf("doing reading\n");
    int read = fscanf(
        f,
        "%u\n"
        "%u\n"
        "%s\n"
        "%u\n"
        "%s\n"
        "%lu\n"
        "%lu\n"
        "%lu\n",
        &conf->sensor_read_interval_seconds,
        &conf->upload_interval_seconds,
        host_buf,
        &conf->port,
        resource_buf,
        &conf->device_id,
        &conf->level_sensor_id,
        &conf->temperature_sensor_id
    );

    fclose(f);

    printf("checking num attributes\n");

    const int num_attributes = 8;
    if (read != num_attributes) return -1;

    printf("copying buffers\n");

    strcpy(conf->host, host_buf);
    strcpy(conf->resource_path, resource_buf);

    printf(
        "%u\n"      // sensor_read_interval_seconds
        "%u\n"      // upload_interval_seconds
        "%s\n"      // host
        "%u\n"      // port
        "%s\n"      // resource
        "%lu\n"     // device_id
        "%lu\n"     // level_sensor_id
        "%lu\n",    // temperature_sensor_id
        conf->sensor_read_interval_seconds,
        conf->upload_interval_seconds,
        conf->host,
        conf->port,
        conf->resource_path,
        conf->device_id,
        conf->level_sensor_id,
        conf->temperature_sensor_id
    );

    return NO_ERROR;
}


//
// STORAGE (CSV)
// each line: timestamp,level,temperature
//

int has_readings(unsigned int* readings_stored) {
    FILE* f = fopen(STORAGE_FILE, "r");
    if (!f) return -1;

    unsigned int count = 0;
    char line[256];

    while (fgets(line, sizeof(line), f) != NULL) {
        if (strlen(line) > 2)
            count++;
    }

    fclose(f);
    *readings_stored = count;

    return NO_ERROR;
}

int write_sensor_readings(float level, float temperature, time_t at) {
    FILE* f = fopen(STORAGE_FILE, "a");
    if (!f) return -1;

    fprintf(f, "%ld,%.3f,%.3f\n", at, level, temperature);
    fclose(f);

    return NO_ERROR;
}

int read_sensor_readings(
        float* level_readings,
        float* temperature_readings,
        time_t* at_readings
) {
    FILE* f = fopen(STORAGE_FILE, "r");
    if (!f) return -1;

    char line[256];
    int idx = 0;
    time_t t;
    float lvl, tmp;

    while (fgets(line, sizeof(line), f) != NULL) {
        if (sscanf(line, "%ld,%f,%f", &t, &lvl, &tmp) == 3) {
            at_readings[idx]        = t;
            level_readings[idx]     = lvl;
            temperature_readings[idx] = tmp;
            idx++;
        }
    }

    fclose(f);
    return idx;  // number of records filled into arrays
}

//
// TIME FUNCTIONS
//
int setup_time(void) {
    return NO_ERROR;
}

int current_time(time_t* out) {
    *out = time(NULL);
    return NO_ERROR;
}

int format_time_str(time_t t, char* out) {
    struct tm tm;
    localtime_r(&t, &tm);
    strftime(out, TIME_STR_LEN, "%Y-%m-%d %H:%M:%S", &tm);
    return NO_ERROR;
}

int format_time_tm(time_t time, struct tm* out_tm) {
    out_tm = gmtime(&time);
    return NO_ERROR;
}

int write_last_upload_time(time_t in) {

    return NO_ERROR;
}

int read_last_upload_time(time_t* out) {

    return NO_ERROR;
}


int sleep_for(unsigned long seconds) {
    sleep(seconds);
    return NO_ERROR;
}

//
// LOGGING (stdout)
//
// int log(char* msg) {
//     printf("[LOG] %s\n", msg);
//     return NO_ERROR;
// }
int log_error(char* msg) {
    fprintf(stderr, "[ERROR] %s\n", msg);
    return NO_ERROR;
}
int log_info(char* msg) {
    printf("[INFO] %s\n", msg);
    return NO_ERROR;
}



//
// ─────────────────────────────────────────────────────────────
//   SENSOR INTERFACE (SIMULATED)
// ─────────────────────────────────────────────────────────────
//

int init_level_sensor() {
    printf("[linux] Level sensor initialized\n");
    return NO_ERROR;
}

int read_level_sensor(float* out) {
    // Simulate river level between 0.5 and 3.5 meters
    *out = 0.5f + ((float)rand() / RAND_MAX) * 3.0f;
    return NO_ERROR;
}

int init_temperature_sensor() {
    printf("[linux] Temperature sensor initialized\n");
    return NO_ERROR;
}

int read_temperature_sensor(float* out) {
    // Simulate temp between 10°C and 25°C
    *out = 10.0f + ((float)rand() / RAND_MAX) * 15.0f;
    return NO_ERROR;
}



//
// ─────────────────────────────────────────────────────────────
//   INTERNET INTERFACE (curl)
// ─────────────────────────────────────────────────────────────
//

static Config* CURRENT_CONFIG = NULL;

int connect_to_server(Config* conf) {
    CURRENT_CONFIG = conf;

    CURLcode global_init = curl_global_init(CURL_GLOBAL_DEFAULT);
    if (global_init != CURLE_OK) {
        fprintf(stderr, "[curl] init error: %s\n", curl_easy_strerror(global_init));
        return -1;
    }

    printf("[linux] HTTP client initialized\n");
    return NO_ERROR;
}

int send_payload(char* payload) {
    if (!CURRENT_CONFIG) {
        fprintf(stderr, "[curl] no config set before send_payload\n");
        return -1;
    }

    CURL* curl = curl_easy_init();
    if (!curl) return -1;

    char url_buffer[256];
    sprintf(url_buffer, "%s:%d%s\0", CURRENT_CONFIG->host, CURRENT_CONFIG->port, CURRENT_CONFIG->resource_path);
    if (strlen(url_buffer) < 1) {
        return -1;
    }


    curl_easy_setopt(curl, CURLOPT_URL, url_buffer);
    // curl_easy_setopt(curl, CURLOPT_URL, CURRENT_CONFIG->host);
    // curl_easy_setopt(curl, CURLOPT_PORT, CURRENT_CONFIG->port);
    curl_easy_setopt(curl, CURLOPT_POST, 1);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(payload));
    struct curl_slist *slist1 = NULL;
    slist1 = curl_slist_append(slist1, "Content-Type: application/json");
    slist1 = curl_slist_append(slist1, "Accept: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, slist1);

    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    char print_buffer[256];
    sprintf(print_buffer, "url: %s payload: %s\n", url_buffer, payload);
    log_info(print_buffer);
    CURLcode res = curl_easy_perform(curl);

    if (res != CURLE_OK) {
        fprintf(stderr, "[curl] send error: %s\n", curl_easy_strerror(res));
        curl_easy_cleanup(curl);
        return -1;
    }

    long code = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);

    printf("[curl] HTTP %ld\n", code);

    curl_easy_cleanup(curl);
    return NO_ERROR;
}
