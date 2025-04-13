#include <WiFi.h>

#include "config.hpp"
#include "internet_transport.hpp"
#include "sensor_data.hpp"

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

void setup() {
  Serial.begin(115200);
  connectToWiFi(SSID, PASS);
  syncClock();
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    collectSensorData();

    if (WiFi.status() == WL_CONNECTED) {
      std::string httpRequestData = formatSensorDataToJson();
      Serial.printf("writing %s to %s%s.\n", httpRequestData.c_str(), HOST, DATA_POST_PATH);
      int httpResponseCode = postData(HOST, DATA_POST_PATH, httpRequestData.c_str());

      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.println("WiFi Disconnected");
    }

    lastTime = millis();
  }
}