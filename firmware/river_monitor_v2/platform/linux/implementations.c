#include "../../core/system.h"
#include "../../core/sensor_interface.h"
#include "../../core/internet_interface.h"

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
static const char* CONFIG_FILE  = "config.txt";


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
    return 0;
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
    return 0;
}

int read_config(Config* conf) {
    FILE* f = fopen(CONFIG_FILE, "r");
    if (!f) {
        // config file missing → write defaults already contained in *conf
        return write_config(conf);
    }

    char host_buf[256];
    char resource_buf[256];
    // memset(host_buf, '\0', 256);

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

    const int num_attributes = 8;
    if (read != num_attributes) return -1;

    strcpy(conf->host, host_buf);
    strcpy(conf->resource_path, resource_buf);

    // printf(
    //     "%u\n"      // sensor_read_interval_seconds
    //     "%u\n"      // upload_interval_seconds
    //     "%s\n"      // host
    //     "%u\n"      // port
    //     "%s\n"      // resource
    //     "%lu\n"     // device_id
    //     "%lu\n"     // level_sensor_id
    //     "%lu\n",    // temperature_sensor_id
    //     conf->sensor_read_interval_seconds,
    //     conf->upload_interval_seconds,
    //     conf->host,
    //     conf->port,
    //     conf->resource_path,
    //     conf->device_id,
    //     conf->level_sensor_id,
    //     conf->temperature_sensor_id
    // );

    return 0;
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

    return 0;
}

int write_sensor_readings(float level, float temperature, time_t at) {
    FILE* f = fopen(STORAGE_FILE, "a");
    if (!f) return -1;

    fprintf(f, "%ld,%.3f,%.3f\n", at, level, temperature);
    fclose(f);

    return 0;
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
    return 0;
}

int current_time(time_t* out) {
    *out = time(NULL);
    return 0;
}

void format_time(time_t t, char* out) {
    struct tm tm;
    localtime_r(&t, &tm);
    strftime(out, TIME_STR_LEN, "%Y-%m-%d %H:%M:%S", &tm);
}

int sleep_for(unsigned long seconds) {
    sleep(seconds);
    return 0;
}

//
// LOGGING (stdout)
//
// int log(char* msg) {
//     printf("[LOG] %s\n", msg);
//     return 0;
// }
int log_error(char* msg) {
    fprintf(stderr, "[ERROR] %s\n", msg);
    return 0;
}
int log_info(char* msg) {
    printf("[INFO] %s\n", msg);
    return 0;
}



//
// ─────────────────────────────────────────────────────────────
//   SENSOR INTERFACE (SIMULATED)
// ─────────────────────────────────────────────────────────────
//

int init_level_sensor() {
    printf("[linux] Level sensor initialized\n");
    return 0;
}

int read_level_sensor(float* out) {
    // Simulate river level between 0.5 and 3.5 meters
    *out = 0.5f + ((float)rand() / RAND_MAX) * 3.0f;
    return 0;
}

int init_temperature_sensor() {
    printf("[linux] Temperature sensor initialized\n");
    return 0;
}

int read_temperature_sensor(float* out) {
    // Simulate temp between 10°C and 25°C
    *out = 10.0f + ((float)rand() / RAND_MAX) * 15.0f;
    return 0;
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
    return 0;
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
    return 0;
}
