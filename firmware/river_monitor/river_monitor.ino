#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "ap204";
const char* password = ".,senha,";
// const char* ssid = "REPLACE_WITH_YOUR_SSID";
// const char* password = "REPLACE_WITH_YOUR_PASSWORD";

const char* serverName = "http://192.168.0.26:3000/sensor_datum/create";

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

void syncClock() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("\nWaiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  syncClock(); 
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    if(WiFi.status()== WL_CONNECTED){
      WiFiClient client;
      HTTPClient http;
      http.begin(client, serverName);      
      // If you need Node-RED/server authentication, insert user and password below
      //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");
      http.addHeader("Content-Type", "application/json");
      char buffer[256];
      int sensorId = 1;
      float value = 1.0;
      auto currentTime = time(nullptr);
      // get formated as UTC time
      String recodedAt = String(ctime(&currentTime));
      sprintf(buffer, "{\"payload\":[{\"sensor_id\":%d,\"value\":%f,\"recorded_at\":\"%s\"}]}", sensorId, value, recodedAt.c_str());
      String httpRequestData = buffer;
      int httpResponseCode = http.POST(httpRequestData);
      
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
        
      // Free resources
      http.end();
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}