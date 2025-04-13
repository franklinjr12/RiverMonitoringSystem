#include "internet_transport.hpp"

void connectToWiFi(const char* ssid, const char* password) {
    WiFi.begin(ssid, password);
    Serial.println("Connecting");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("Connected to WiFi network with IP Address: ");
    Serial.println(WiFi.localIP());
}

void syncClock() {
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.println("\nWaiting for time");
    while (!time(nullptr)) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println("");
}

int postData(const char* host, const char* path, const char* payload) {
    WiFiClient client;
    HTTPClient http;

    char buffer[256];
    sprintf(buffer, "%s%s", host, path);
    String httpUrl = String(buffer);

    http.begin(client, httpUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(payload);

    http.end();
    return httpResponseCode;
}