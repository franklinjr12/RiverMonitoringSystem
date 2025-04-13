#ifndef INTERNET_TRANSPORT_HPP
#define INTERNET_TRANSPORT_HPP

#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

void connectToWiFi(const char* ssid, const char* password);
void syncClock();
int postData(const char* host, const char* path, const char* payload);

#endif // INTERNET_TRANSPORT_HPP