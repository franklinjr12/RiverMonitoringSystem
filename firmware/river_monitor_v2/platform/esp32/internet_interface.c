#include "../../core/errors.h"
#include "../../core/internet_interface.h"
#include "../../core/system.h"
#include "../../core/config.h"

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
        Serial.println("[ERROR] WiFi credentials not set. Call set_wifi_credentials() first");
        return -1;
    }

    Serial.print("[INFO] Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, strlen(WIFI_PASSWORD) > 0 ? WIFI_PASSWORD : NULL);

    int maxAttempts = 60; // ~30 seconds (60 * 500ms)
    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("[INFO] WiFi connected, IP address: ");
        Serial.println(WiFi.localIP());
        wifi_connected = true;
        return NO_ERROR;
    } else {
        Serial.println("[ERROR] Failed to connect to WiFi");
        wifi_connected = false;
        return -1;
    }
}

// Helper function to check/reconnect internet interface
static int ensure_internet_connected() {
    if (WiFi.status() == WL_CONNECTED) {
        wifi_connected = true;
        return NO_ERROR;
    }
    
    // Attempt to reconnect
    wifi_connected = false;
    return connect_wifi_interface();
}

int connect_to_server(Config* conf) {
    CURRENT_CONFIG = conf;

    // Connect to internet interface (WiFi in this case)
    // This structure makes it easy to replace with 2G/other interfaces
    int ret = connect_wifi_interface();
    if (ret != NO_ERROR) {
        Serial.println("[ERROR] Failed to connect to internet interface");
        return ret;
    }

    Serial.println("[INFO] Internet interface connected");
    return NO_ERROR;
}

int send_payload(char* payload) {
    if (!CURRENT_CONFIG) {
        Serial.println("[ERROR] No config set before send_payload");
        return -1;
    }

    // Ensure internet connection is active
    if (ensure_internet_connected() != NO_ERROR) {
        Serial.println("[ERROR] Internet interface not connected");
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

    Serial.print("[INFO] Sending POST to: ");
    Serial.println(url_buffer);
    Serial.print("[INFO] Payload: ");
    Serial.println(payload);

    // Use WiFiClientSecure for HTTPS
    WiFiClientSecure client;
    client.setInsecure(); // For development: do not validate certificate (not for production)

    HTTPClient http;

    if (!http.begin(client, url_buffer)) {
        Serial.println("[ERROR] Failed to start HTTP connection");
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
        Serial.print("[INFO] HTTP response code: ");
        Serial.println(httpCode);
        
        if (httpCode >= 200 && httpCode < 300) {
            String response = http.getString();
            Serial.print("[INFO] Response body: ");
            Serial.println(response);
            http.end();
            return NO_ERROR;
        } else {
            Serial.print("[ERROR] HTTP error code: ");
            Serial.println(httpCode);
            String response = http.getString();
            Serial.print("[ERROR] Response: ");
            Serial.println(response);
            http.end();
            return -1;
        }
    } else {
        Serial.print("[ERROR] HTTP POST failed, error: ");
        Serial.println(http.errorToString(httpCode));
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

