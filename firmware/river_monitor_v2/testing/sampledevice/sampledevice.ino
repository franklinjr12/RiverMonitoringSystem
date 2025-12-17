#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

const char* ssid = "ssid";
const char* password = "pass";

const char* host = "https://rivermonitoringbackend.onrender.com";
const int   port = 443;
const char* resource_path = "/sensor_datum/create";

// How long to wait between sends (in milliseconds)
const unsigned long LOOP_DELAY_MS = 10000; // 10 seconds

void connectToWifi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int maxAttempts = 60; // ~30 seconds (60 * 500ms)
  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected, IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Failed to connect to WiFi");
  }
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

String buildSensorJsonPayload() {
  // Simple random value generator
  // Range will be from 1.0 to 5.0, similar to the Go simulator's first sensor
  float levelValue = 1.0 + (random(0, 4000) / 1000.0); // 1.0 .. ~5.0
  float temperatureValue = 20.0 + (random(0, 1000) / 100.0); // 20.0 .. ~30.0

  // For simplicity, use a fixed timestamp string
  time_t now = time(nullptr);
  char recordedAt[64];
  strftime(recordedAt, sizeof(recordedAt), "%FT%TZ", gmtime(&now));

  int levelSensorId = 5; // arbitrary sensor ID to match Go example
  int temperatureSensorId = 6; // arbitrary sensor ID to match Go example

  // {"payload":[{"sensor_id":3,"value":X,"recorded_at":"..."}]}
  String json = "{";
  json += "\"payload\":[";
  json += "{";
  json += "\"sensor_id\":" + String(levelSensorId) + ",";
  json += "\"value\":" + String(levelValue, 3) + ",";
  json += "\"recorded_at\":\"" + String(recordedAt) + "\"";
  json += "}";
  json += ",";
  json += "{";
  json += "\"sensor_id\":" + String(temperatureSensorId) + ",";
  json += "\"value\":" + String(temperatureValue, 3) + ",";
  json += "\"recorded_at\":\"" + String(recordedAt) + "\"";
  json += "}";
  json += "]";
  json += "}";

  return json;
}

bool sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot send data");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure(); // For simplicity: do not validate certificate (not for production)

  HTTPClient http;

  String url = String(host) + ":" + String(port) + String(resource_path);
  String jsonPayload = buildSensorJsonPayload();

  Serial.print("Sending POST to: ");
  Serial.println(url);
  Serial.print("Payload: ");
  Serial.println(jsonPayload);

  if (!http.begin(client, url)) {
    Serial.println("Failed to start HTTP connection");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    Serial.print("HTTP response code: ");
    Serial.println(httpCode);
    String response = http.getString();
    Serial.print("Response body: ");
    Serial.println(response);
  } else {
    Serial.print("HTTP POST failed, error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
  return httpCode >= 200 && httpCode < 300;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println();
  Serial.println("Sample ESP32 device simulator started");

  // Seed random generator
  randomSeed(analogRead(0));

  connectToWifi();
  syncClock();
}

void loop() {
  // Ensure WiFi is connected before sending
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, attempting to reconnect...");
    connectToWifi();
  }

  Serial.println("Generating and sending sensor data...");
  bool ok = sendSensorData();

  if (ok) {
    Serial.println("Sensor data sent successfully");
  } else {
    Serial.println("Failed to send sensor data");
  }

  Serial.print("Sleeping for ");
  Serial.print(LOOP_DELAY_MS / 1000);
  Serial.println(" seconds");
  delay(LOOP_DELAY_MS);
}