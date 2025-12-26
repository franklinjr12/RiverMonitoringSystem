#include "errors.h"
#include "internet_interface.h"
#include "system.h"
#include "config.h"

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <string.h>

//
// ─────────────────────────────────────────────────────────────
//   INTERNET INTERFACE (WiFi - extensible for other interfaces)
// ─────────────────────────────────────────────────────────────
//

typedef enum {
    WIFI,
    CELLULAR_2G
} InternetMode;

InternetMode internet_mode = WIFI; 

static Config* CURRENT_CONFIG = NULL;
static bool wifi_connected = false;

// WiFi credentials - these should ideally come from config or EEPROM
// For now, keeping structure extensible for future config-based approach
static char WIFI_SSID[64] = "";
static char WIFI_PASSWORD[64] = "";
static bool wifi_credentials_set = false;

// Helper function to connect WiFi (can be replaced for other interfaces)
static int connect_wifi_interface() {
    if (WiFi.status() == WL_CONNECTED) {
        wifi_connected = true;
        return NO_ERROR;
    }

    // Check if WiFi credentials are set
    if (!wifi_credentials_set || strlen(WIFI_SSID) == 0) {
        log_error("WiFi credentials not set. Call set_wifi_credentials() first");
        return -1;
    }

    log_info_f("Connecting to WiFi: %s", WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, strlen(WIFI_PASSWORD) > 0 ? WIFI_PASSWORD : NULL);

    int maxAttempts = 60; // ~30 seconds (60 * 500ms)
    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
        delay(500);
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        log_info_f("WiFi connected, IP address: %s", WiFi.localIP().toString().c_str());
        wifi_connected = true;
        return NO_ERROR;
    } else {
        log_error("Failed to connect to WiFi");
        wifi_connected = false;
        return -1;
    }
}

// Helper function to check/reconnect internet interface
static int ensure_internet_connected() {
    switch(internet_mode) {
        case WIFI:
        if (WiFi.status() == WL_CONNECTED) {
            wifi_connected = true;
            return NO_ERROR;
        }
        
        // Attempt to reconnect
        wifi_connected = false;
        return connect_wifi_interface();
        case CELLULAR_2G:
        log_error("Cellular interface not ready");
        break;
    }
    return -1;
}

int connect_to_server(Config* conf) {
    CURRENT_CONFIG = conf;
    int ret;

    switch(internet_mode) {
        case WIFI:
        ret = connect_wifi_interface();
        if (ret != NO_ERROR) {
            log_error("Failed to connect to internet interface");
            return ret;
        }
        break;
        case CELLULAR_2G:
        log_error("Cellular interface not ready");
        break;
    }

    log_info("Internet interface connected");
    return NO_ERROR;
}

int send_payload(char* payload) {
    if (!CURRENT_CONFIG) {
        log_error("No config set before send_payload");
        return -1;
    }

    // Ensure internet connection is active
    if (ensure_internet_connected() != NO_ERROR) {
        log_error("Internet interface not connected");
        return -1;
    }

    // Build URL from config
    char url_buffer[512];
    // Handle HTTPS URLs (config->host may already include https://)
    if (strncmp(CURRENT_CONFIG->host, "https://", 8) == 0) {
        snprintf(url_buffer, sizeof(url_buffer), "%s:%d%s", 
                 CURRENT_CONFIG->host, CURRENT_CONFIG->port, CURRENT_CONFIG->resource_path);
    } else {
        snprintf(url_buffer, sizeof(url_buffer), "https://%s:%d%s", 
                 CURRENT_CONFIG->host, CURRENT_CONFIG->port, CURRENT_CONFIG->resource_path);
    }

    log_info_f("Sending POST to: %s", url_buffer);
    log_info_f("Payload: %s", payload);

    // Use WiFiClientSecure for HTTPS
    WiFiClientSecure client;
    client.setInsecure(); // For development: do not validate certificate (not for production)

    HTTPClient http;

    if (!http.begin(client, url_buffer)) {
        log_error("Failed to start HTTP connection");
        return -1;
    }

    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");

    // Set timeout
    http.setTimeout(10000); // 10 seconds

    // Send POST request
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
        log_info_f("HTTP response code: %d", httpCode);
        
        if (httpCode >= 200 && httpCode < 300) {
            String response = http.getString();
            log_info_f("Response body: %s", response.c_str());
            http.end();
            return NO_ERROR;
        } else {
            char error_msg[256];
            String response = http.getString();
            snprintf(error_msg, sizeof(error_msg), "HTTP error code: %d, Response: %s", httpCode, response.c_str());
            log_error(error_msg);
            http.end();
            return -1;
        }
    } else {
        char error_msg[256];
        snprintf(error_msg, sizeof(error_msg), "HTTP POST failed, error: %s", http.errorToString(httpCode).c_str());
        log_error(error_msg);
        http.end();
        return -1;
    }
}

// Function to set WiFi credentials (should be called before connect_to_server)
// This structure makes it easy to replace with config-based or other credential sources
void set_wifi_credentials(const char* ssid, const char* password) {
    if (ssid) {
        strncpy(WIFI_SSID, ssid, sizeof(WIFI_SSID) - 1);
        WIFI_SSID[sizeof(WIFI_SSID) - 1] = '\0';
    }
    if (password) {
        strncpy(WIFI_PASSWORD, password, sizeof(WIFI_PASSWORD) - 1);
        WIFI_PASSWORD[sizeof(WIFI_PASSWORD) - 1] = '\0';
    }
    wifi_credentials_set = true;
}

