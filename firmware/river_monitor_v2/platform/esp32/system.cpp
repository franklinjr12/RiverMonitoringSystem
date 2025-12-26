#include "errors.h"
#include "system.h"
#include "config.h"

#include <Arduino.h>
#include <SPIFFS.h>
#include <Preferences.h>
#include <time.h>
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

//
// FILE PATHS FOR ESP32 STORAGE
//
static const char* STORAGE_FILE = "/readings.csv";
static const char* CONFIG_FILE  = "/config.bin";
static const char* LAST_UPLOAD_KEY  = "_last_upload";

// Preferences namespace for KV storage
static Preferences preferences;

//
// ─────────────────────────────────────────────────────────────
//   SYSTEM IMPLEMENTATION
// ─────────────────────────────────────────────────────────────
//

void panic(void) {
    log_error("Unrecoverable error - restarting");
    delay(1000);
    ESP.restart();
    while(1) {} // Infinite loop as fallback
}

int setup_storage(void) {
    // Initialize SPIFFS
    if (!SPIFFS.begin(true)) {
        log_error("SPIFFS mount failed");
        return -1;
    }
    
    // Initialize Preferences for KV storage
    preferences.begin("river_monitor", false);
    
    // Create storage file if it doesn't exist
    File f = SPIFFS.open(STORAGE_FILE, "a");
    if (!f) {
        log_error("Failed to create storage file");
        return -1;
    }
    f.close();
    
    return NO_ERROR;
}

int write_kv(char* key, void* value, size_t value_size) {
    // Use Preferences API for KV storage
    if (value_size == sizeof(int)) {
        preferences.putInt(key, *(int*)value);
    } else if (value_size == sizeof(long)) {
        preferences.putLong(key, *(long*)value);
    } else if (value_size == sizeof(float)) {
        preferences.putFloat(key, *(float*)value);
    } else if (value_size == sizeof(double)) {
        preferences.putDouble(key, *(double*)value);
    } else {
        // For arbitrary binary data, use putBytes
        preferences.putBytes(key, value, value_size);
    }
    return NO_ERROR;
}

int read_kv(char* key, void* value, size_t value_size) {
    // Use Preferences API for KV storage
    if (value_size == sizeof(int)) {
        *(int*)value = preferences.getInt(key, 0);
    } else if (value_size == sizeof(long)) {
        *(long*)value = preferences.getLong(key, 0);
    } else if (value_size == sizeof(float)) {
        *(float*)value = preferences.getFloat(key, 0.0f);
    } else if (value_size == sizeof(double)) {
        *(double*)value = preferences.getDouble(key, 0.0);
    } else {
        // For arbitrary binary data, use getBytes
        preferences.getBytes(key, value, value_size);
    }
    return NO_ERROR;
}

//
// CONFIG I/O
//
int write_config(Config* conf) {
    File f = SPIFFS.open(CONFIG_FILE, "w");
    if (!f) {
        log_error("Failed to open config file for writing");
        return -1;
    }

    // Write config in same format as Linux version
    f.printf("%u\n", conf->sensor_read_interval_seconds);
    f.printf("%u\n", conf->upload_interval_seconds);
    f.printf("%s\n", conf->host);
    f.printf("%u\n", conf->port);
    f.printf("%s\n", conf->resource_path);
    f.printf("%lu\n", conf->device_id);
    f.printf("%lu\n", conf->level_sensor_id);
    f.printf("%lu\n", conf->temperature_sensor_id);

    f.close();
    return NO_ERROR;
}

int read_config(Config* conf) {
    File f = SPIFFS.open(CONFIG_FILE, "r");
    if (!f) {
        log_info("Config file does not exist, creating default");
        // Config file missing → write defaults already contained in *conf
        return write_config(conf);
    }

    char host_buf[256];
    char resource_buf[256];
    char line[256];
    int line_num = 0;
    
    // Read config line by line (same format as Linux version)
    while (f.available() && line_num < 8) {
        int len = f.readBytesUntil('\n', line, sizeof(line) - 1);
        if (len > 0) {
            line[len] = '\0';
            // Remove trailing newline/carriage return if present
            while (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r')) {
                line[--len] = '\0';
            }
            
            switch (line_num) {
                case 0:
                    conf->sensor_read_interval_seconds = atoi(line);
                    break;
                case 1:
                    conf->upload_interval_seconds = atoi(line);
                    break;
                case 2:
                    strncpy(host_buf, line, sizeof(host_buf) - 1);
                    host_buf[sizeof(host_buf) - 1] = '\0';
                    break;
                case 3:
                    conf->port = atoi(line);
                    break;
                case 4:
                    strncpy(resource_buf, line, sizeof(resource_buf) - 1);
                    resource_buf[sizeof(resource_buf) - 1] = '\0';
                    break;
                case 5:
                    conf->device_id = strtoul(line, NULL, 10);
                    break;
                case 6:
                    conf->level_sensor_id = strtoul(line, NULL, 10);
                    break;
                case 7:
                    conf->temperature_sensor_id = strtoul(line, NULL, 10);
                    break;
            }
            line_num++;
        }
    }

    f.close();

    const int num_attributes = 8;
    if (line_num != num_attributes) {
        log_error("Failed to read all config attributes");
        return -1;
    }

    // Copy buffers to config struct
    strcpy(conf->host, host_buf);
    strcpy(conf->resource_path, resource_buf);

    return NO_ERROR;
}

//
// STORAGE (CSV)
// each line: timestamp,level,temperature
//

int has_readings(unsigned int* readings_stored) {
    File f = SPIFFS.open(STORAGE_FILE, "r");
    if (!f) {
        *readings_stored = 0;
        return NO_ERROR;
    }

    unsigned int count = 0;
    char line[256];

    while (f.available()) {
        int len = f.readBytesUntil('\n', line, sizeof(line) - 1);
        if (len > 0) {
            line[len] = '\0';
            if (strlen(line) > 2) {
                count++;
            }
        }
    }

    f.close();
    *readings_stored = count;

    return NO_ERROR;
}

int write_sensor_readings(float level, float temperature, time_t at) {
    File f = SPIFFS.open(STORAGE_FILE, "a");
    if (!f) {
        log_error("Failed to open storage file for appending");
        return -1;
    }

    f.printf("%ld,%.3f,%.3f\n", at, level, temperature);
    f.close();

    return NO_ERROR;
}

int read_sensor_readings(
        float* level_readings,
        float* temperature_readings,
        time_t* at_readings
) {
    File f = SPIFFS.open(STORAGE_FILE, "r");
    if (!f) {
        return 0; // No readings available
    }

    char line[256];
    int idx = 0;
    time_t t;
    float lvl, tmp;

    while (f.available() && idx < 100) { // Limit to prevent overflow
        int len = f.readBytesUntil('\n', line, sizeof(line) - 1);
        if (len > 0) {
            line[len] = '\0';
            if (sscanf(line, "%ld,%f,%f", &t, &lvl, &tmp) == 3) {
                at_readings[idx] = t;
                level_readings[idx] = lvl;
                temperature_readings[idx] = tmp;
                idx++;
            }
        }
    }

    f.close();
    return idx;  // number of records filled into arrays
}

int clear_readings() {
    File f = SPIFFS.open(STORAGE_FILE, "w");
    if (!f) {
        log_error("Failed to open storage file for clearing");
        return -1;
    }
    f.close();
    return NO_ERROR;
}

//
// TIME FUNCTIONS
//
int setup_time(void) {
    // Configure NTP (same servers as sampledevice.ino)
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    
    log_info("Waiting for NTP time sync");
    int attempts = 0;
    while (!time(nullptr) && attempts < 30) {
        delay(1000);
        attempts++;
    }
    
    if (time(nullptr)) {
        log_info("NTP time synchronized");
        return NO_ERROR;
    } else {
        log_error("Failed to sync NTP time");
        return -1;
    }
}

int current_time(time_t* out) {
    *out = time(nullptr);
    return NO_ERROR;
}

int format_time_str(time_t t, char* out) {
    struct tm tm;
    gmtime_r(&t, &tm);
    strftime(out, TIME_STR_LEN, "%Y-%m-%d %H:%M:%S", &tm);
    return NO_ERROR;
}

int format_time_tm(time_t time, struct tm* out_tm) {
    struct tm* tm_ptr = gmtime(&time);
    if (tm_ptr) {
        *out_tm = *tm_ptr;
        return NO_ERROR;
    }
    return -1;
}

int write_last_upload_time(time_t in) {
    return write_kv((char*)LAST_UPLOAD_KEY, &in, sizeof(in));
}

int read_last_upload_time(time_t* out) {
    return read_kv((char*)LAST_UPLOAD_KEY, out, sizeof(time_t));
}

int sleep_for(unsigned long seconds) {
    const unsigned long ms_factor = 1000;
    delay(seconds * ms_factor);
    return NO_ERROR;
}

//
// LOGGING (Serial)
//
int log_error(char* msg) {
    Serial.print("[ERROR] ");
    Serial.println(msg);
    return NO_ERROR;
}

int log_info(char* msg) {
    Serial.print("[INFO] ");
    Serial.println(msg);
    return NO_ERROR;
}

int log_info_f(char *fmt, ...) {
    va_list args;
    va_start(args, fmt);

    Serial.print("[INFO] ");
    
    // Format the message into a buffer
    char buffer[256];
    vsnprintf(buffer, sizeof(buffer), fmt, args);
    Serial.print(buffer);

    va_end(args);
    return NO_ERROR;
}

//
// PAYLOAD CHECKING
//
int should_send_payload(Config* conf) {
    time_t now;
    if (current_time(&now) != NO_ERROR) {
        return 0;
    }
    
    time_t last_upload = 0;
    read_last_upload_time(&last_upload);
    
    double time_diff_seconds = difftime(now, last_upload);
    
    return (time_diff_seconds >= (double)conf->upload_interval_seconds) ? 1 : 0;
}

